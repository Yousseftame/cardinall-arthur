import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import {
  PRODUCT_BOTTLE_SIZE,
  slugifyProductName,
  type ProductStatus,
} from '../../services/products.service';
import type { CategoryRecord } from '../../services/categories.service';
import {
  DEFAULT_PRODUCT_IMAGE_KEY,
  MAX_PRODUCT_GALLERY_IMAGES,
  PRODUCT_IMAGES,
  resolveProductImage,
} from '../../data/productImages';
import { cn } from '../../lib/utils';

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  /** Ordered gallery keys (1–N). First = primary. */
  imageKeys: string[];
  status: ProductStatus;
  slug: string;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  categories: CategoryRecord[];
  initialValues?: Partial<ProductFormValues>;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
}

const emptyValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  categoryName: '',
  imageKeys: [DEFAULT_PRODUCT_IMAGE_KEY],
  status: 'active',
  slug: '',
};

export default function ProductFormModal({
  isOpen,
  mode,
  categories,
  initialValues,
  isLoading = false,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [priceInput, setPriceInput] = useState('');
  const [stockInput, setStockInput] = useState('0');
  const [slugTouched, setSlugTouched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  const activeCategories = useMemo(
    () => categories.filter((c) => c.status === 'active'),
    [categories]
  );

  const categoryOptions = useMemo(() => {
    const list = [...activeCategories];
    const selectedId = initialValues?.categoryId;
    if (selectedId) {
      const selected = categories.find((c) => c.id === selectedId);
      if (selected && !list.some((c) => c.id === selected.id)) {
        list.unshift(selected);
      }
    }
    return list;
  }, [activeCategories, categories, initialValues?.categoryId]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const initialGallery =
      Array.isArray(initialValues?.imageKeys) && initialValues.imageKeys.length > 0
        ? initialValues.imageKeys
        : [DEFAULT_PRODUCT_IMAGE_KEY];

    const next: ProductFormValues = {
      ...emptyValues,
      ...initialValues,
      imageKeys: initialGallery.slice(0, MAX_PRODUCT_GALLERY_IMAGES),
      status: initialValues?.status || 'active',
    };

    setValues(next);
    setPriceInput(next.price > 0 ? String(next.price) : '');
    setStockInput(String(next.stock ?? 0));
    setSlugTouched(Boolean(initialValues?.slug));
    setError('');
  }, [isOpen, initialValues]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const title = mode === 'create' ? 'New Product' : 'Edit Product';
  const confirmText = mode === 'create' ? 'Create Product' : 'Save Changes';

  const setField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugifyProductName(name),
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setValues((prev) => ({
      ...prev,
      categoryId,
      categoryName: cat?.name || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const name = values.name.trim();
    const description = values.description.trim();
    const price = parseFloat(priceInput.replace(/,/g, ''));
    const stock = parseInt(stockInput, 10);

    if (!name) {
      setError('Product name is required.');
      return;
    }
    if (!description) {
      setError('Description is required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid price greater than 0.');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setError('Stock must be 0 or more.');
      return;
    }
    if (!values.categoryId) {
      setError('Select a category.');
      return;
    }
    if (!values.imageKeys.length) {
      setError('Add at least one gallery image.');
      return;
    }

    setError('');
    await onSubmit({
      ...values,
      name,
      description,
      price,
      stock,
      imageKeys: values.imageKeys.slice(0, MAX_PRODUCT_GALLERY_IMAGES),
      slug: values.slug.trim() || slugifyProductName(name),
      categoryName:
        values.categoryName ||
        categories.find((c) => c.id === values.categoryId)?.name ||
        '',
    });
  };

  const toggleGalleryImage = (key: string) => {
    setValues((prev) => {
      const exists = prev.imageKeys.includes(key);
      if (exists) {
        if (prev.imageKeys.length <= 1) return prev;
        return { ...prev, imageKeys: prev.imageKeys.filter((k) => k !== key) };
      }
      if (prev.imageKeys.length >= MAX_PRODUCT_GALLERY_IMAGES) return prev;
      return { ...prev, imageKeys: [...prev.imageKeys, key] };
    });
  };

  const moveGalleryImage = (index: number, direction: -1 | 1) => {
    setValues((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.imageKeys.length) return prev;
      const next = [...prev.imageKeys];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return { ...prev, imageKeys: next };
    });
  };

  const removeGalleryImage = (index: number) => {
    setValues((prev) => {
      if (prev.imageKeys.length <= 1) return prev;
      return { ...prev, imageKeys: prev.imageKeys.filter((_, i) => i !== index) };
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(44,14,17,0.3)] border border-gray-100 animate-in zoom-in-95 duration-200 scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center mb-4">
          <Package className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-[#2C0E11] tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Products appear on the home section, marketplace, and product detail pages. Images are selected from static assets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="product-name" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Midnight Rose"
              disabled={isLoading}
              autoFocus
              className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-price" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Price (EGP)
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="2111"
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-stock" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Stock
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                placeholder="10"
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-category" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Category
              </label>
              <select
                id="product-category"
                value={values.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isLoading || categoryOptions.length === 0}
                className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60 cursor-pointer"
              >
                <option value="">
                  {categoryOptions.length === 0 ? 'No categories available' : 'Select category'}
                </option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                    {cat.status === 'inactive' ? ' (inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Bottle Size
              </span>
              <div className="h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-semibold text-gray-700 flex items-center">
                {PRODUCT_BOTTLE_SIZE}
                <span className="ml-2 text-[11px] font-medium text-gray-400 normal-case tracking-normal">
                  Fixed for all products
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-slug" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Share Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono shrink-0">/product/</span>
              <input
                id="product-slug"
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField('slug', slugifyProductName(e.target.value));
                }}
                placeholder="midnight-rose"
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-mono text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-description" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Description
            </label>
            <textarea
              id="product-description"
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Short product story..."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border border-transparent focus:border-[#2C0E11]/15 disabled:opacity-60 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Image Gallery
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {values.imageKeys.length}/{MAX_PRODUCT_GALLERY_IMAGES} · first is primary
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_IMAGES.map((img) => {
                const selected = values.imageKeys.includes(img.key);
                const order = values.imageKeys.indexOf(img.key);
                return (
                  <button
                    key={img.key}
                    type="button"
                    disabled={isLoading || (!selected && values.imageKeys.length >= MAX_PRODUCT_GALLERY_IMAGES)}
                    onClick={() => toggleGalleryImage(img.key)}
                    className={cn(
                      'relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer disabled:opacity-40',
                      selected
                        ? 'border-[#2C0E11] ring-2 ring-[#2C0E11]/20'
                        : 'border-transparent hover:border-gray-200'
                    )}
                    title={selected ? `Remove ${img.label}` : `Add ${img.label}`}
                  >
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                    {selected && (
                      <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-[#2C0E11] text-white text-[10px] font-bold flex items-center justify-center">
                        {order + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {values.imageKeys.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-gray-400 font-medium">
                  Gallery order (reorder or remove)
                </p>
                <div className="flex flex-col gap-2">
                  {values.imageKeys.map((key, index) => (
                    <div
                      key={`${key}-${index}`}
                      className="flex items-center gap-2 p-2 rounded-2xl bg-[#F4F4F4]"
                    >
                      <img
                        src={resolveProductImage(key)}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {PRODUCT_IMAGES.find((i) => i.key === key)?.label || key}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {index === 0 ? 'Primary thumbnail' : `Gallery #${index + 1}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={isLoading || index === 0}
                          onClick={() => moveGalleryImage(index, -1)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLoading || index === values.imageKeys.length - 1}
                          onClick={() => moveGalleryImage(index, 1)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLoading || values.imageKeys.length <= 1}
                          onClick={() => removeGalleryImage(index)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white disabled:opacity-30 cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Status
            </span>
            <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setField('status', 'active')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer',
                  values.status === 'active'
                    ? 'bg-[#2C0E11] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', values.status === 'active' ? 'bg-[#C9A86A]' : 'bg-gray-300')} />
                Active
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setField('status', 'inactive')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer',
                  values.status === 'inactive'
                    ? 'bg-white text-gray-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', values.status === 'inactive' ? 'bg-gray-400' : 'bg-gray-300')} />
                Inactive
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#2C0E11] hover:bg-[#3D1418] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#2C0E11]/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
