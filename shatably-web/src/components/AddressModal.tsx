'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Address } from '@/types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  editAddress?: Address | null;
}

const GOVERNORATES = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'الشرقية', en: 'Sharqia' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'المنوفية', en: 'Monufia' },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'الفيوم', en: 'Fayoum' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'أسيوط', en: 'Asyut' },
  { ar: 'سوهاج', en: 'Sohag' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
];

export default function AddressModal({ isOpen, onClose, onSave, editAddress }: AddressModalProps) {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    label: '',
    fullAddress: '',
    area: '',
    city: '',
    governorate: '',
    landmark: '',
    contactName: '',
    contactPhone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (editAddress) {
      setFormData({
        label: editAddress.label || '',
        fullAddress: editAddress.fullAddress || '',
        area: editAddress.area || '',
        city: editAddress.city || '',
        governorate: editAddress.governorate || '',
        landmark: editAddress.landmark || '',
        contactName: editAddress.contactName || '',
        contactPhone: editAddress.contactPhone || '',
        isDefault: editAddress.isDefault || false,
      });
    } else {
      setFormData({
        label: '',
        fullAddress: '',
        area: '',
        city: '',
        governorate: '',
        landmark: '',
        contactName: '',
        contactPhone: '',
        isDefault: false,
      });
    }
    setError('');
  }, [editAddress, isOpen]);

  const content = {
    ar: {
      addTitle: 'إضافة عنوان جديد',
      editTitle: 'تعديل العنوان',
      label: 'اسم العنوان',
      labelPlaceholder: 'مثال: المنزل، العمل',
      fullAddress: 'العنوان التفصيلي',
      fullAddressPlaceholder: 'رقم المبنى، الشارع، الحي',
      area: 'المنطقة',
      areaPlaceholder: 'اسم المنطقة',
      city: 'المدينة',
      cityPlaceholder: 'اسم المدينة',
      governorate: 'المحافظة',
      governoratePlaceholder: 'اختر المحافظة',
      landmark: 'علامة مميزة (اختياري)',
      landmarkPlaceholder: 'بالقرب من...',
      contactName: 'اسم المستلم',
      contactNamePlaceholder: 'الاسم الكامل',
      contactPhone: 'رقم الهاتف',
      contactPhonePlaceholder: '01XXXXXXXXX',
      isDefault: 'تعيين كعنوان افتراضي',
      save: 'حفظ العنوان',
      saving: 'جاري الحفظ...',
      cancel: 'إلغاء',
      required: 'هذا الحقل مطلوب',
      invalidPhone: 'رقم الهاتف غير صحيح',
    },
    en: {
      addTitle: 'Add New Address',
      editTitle: 'Edit Address',
      label: 'Address Label',
      labelPlaceholder: 'e.g., Home, Work',
      fullAddress: 'Full Address',
      fullAddressPlaceholder: 'Building number, Street, District',
      area: 'Area',
      areaPlaceholder: 'Area name',
      city: 'City',
      cityPlaceholder: 'City name',
      governorate: 'Governorate',
      governoratePlaceholder: 'Select governorate',
      landmark: 'Landmark (optional)',
      landmarkPlaceholder: 'Near...',
      contactName: 'Contact Name',
      contactNamePlaceholder: 'Full name',
      contactPhone: 'Phone Number',
      contactPhonePlaceholder: '01XXXXXXXXX',
      isDefault: 'Set as default address',
      save: 'Save Address',
      saving: 'Saving...',
      cancel: 'Cancel',
      required: 'This field is required',
      invalidPhone: 'Invalid phone number',
    },
  };

  const t = content[language];

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^01[0125][0-9]{8}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone
    if (!validatePhone(formData.contactPhone)) {
      setError(t.invalidPhone);
      return;
    }

    setIsLoading(true);
    try {
      const url = editAddress
        ? `${process.env.NEXT_PUBLIC_API_URL}/addresses/${editAddress.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/addresses`;

      const response = await fetch(url, {
        method: editAddress ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save address');
      }

      onSave(data.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold">
              {editAddress ? t.editTitle : t.addTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.label} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder={t.labelPlaceholder}
              className="input"
              required
            />
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.fullAddress} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              placeholder={t.fullAddressPlaceholder}
              className="input min-h-[80px]"
              required
            />
          </div>

          {/* Area & City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.area} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder={t.areaPlaceholder}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.city} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={t.cityPlaceholder}
                className="input"
                required
              />
            </div>
          </div>

          {/* Governorate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.governorate} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.governorate}
              onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
              className="input"
              required
            >
              <option value="">{t.governoratePlaceholder}</option>
              {GOVERNORATES.map((gov) => (
                <option key={gov.en} value={gov.en}>
                  {language === 'ar' ? gov.ar : gov.en}
                </option>
              ))}
            </select>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.landmark}
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder={t.landmarkPlaceholder}
              className="input"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.contactName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder={t.contactNamePlaceholder}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.contactPhone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/\D/g, '') })}
                placeholder={t.contactPhonePlaceholder}
                className="input"
                dir="ltr"
                maxLength={11}
                required
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600"
            />
            <span className="text-sm text-gray-700">{t.isDefault}</span>
          </label>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
