import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  type ApiVehicle,
  type CarType,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  type VehicleImage,
} from '@/types/vehicle';
import { VehicleImageUploader } from '@/features/customers/vehicles/components/vehicle-image-uploader';
import {
  carBrands,
  carModelsByBrand,
  OTHER_VEHICLE_VALUE,
  popularCarBrands,
} from '@/features/customers/vehicles/data/car-catalog';

const currentYear = new Date().getFullYear();
const productionYears = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, index) => currentYear - index
);
const vietnamLicensePlatePattern = /^[0-9]{2}[A-Z]{1,2}-?[0-9]{3}\.?[0-9]{2}$/i;
const carTypeOptions: Array<{ value: CarType; label: string }> = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup / Bán tải' },
];

const vehicleSchema = z
  .object({
    brand: z.string().trim().min(1, 'Vui lòng chọn hãng xe.'),
    customBrand: z.string().trim().optional(),
    model: z.string().trim().min(1, 'Vui lòng chọn dòng xe.'),
    customModel: z.string().trim().optional(),
    licensePlate: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập biển số xe.')
      .regex(
        vietnamLicensePlatePattern,
        'Biển số xe không đúng định dạng. Ví dụ: 70A-99999 hoặc 30A-123.45.'
      ),
    year: z
      .number({ message: 'Vui lòng nhập năm sản xuất.' })
      .int('Năm sản xuất phải là số nguyên.')
      .min(1900, 'Năm sản xuất không hợp lệ.')
      .max(currentYear, 'Năm sản xuất không được lớn hơn năm hiện tại.'),
    carType: z.enum(['sedan', 'suv', 'pickup'], { message: 'Vui lòng chọn loại xe.' }),
  })
  .superRefine((values, ctx) => {
    if (values.brand === OTHER_VEHICLE_VALUE && !values.customBrand?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customBrand'],
        message: 'Vui lòng nhập hãng xe.',
      });
    }

    if (values.model === OTHER_VEHICLE_VALUE && !values.customModel?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customModel'],
        message: 'Vui lòng nhập dòng xe.',
      });
    }
  });

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  formId?: string;
  initialValue?: ApiVehicle | null;
  existingImages?: VehicleImage[];
  selectedFiles: File[];
  isSubmitting: boolean;
  onFilesChange: (files: File[]) => void;
  onSubmit: (payload: CreateVehiclePayload | UpdateVehiclePayload) => Promise<void> | void;
}

const createDefaultValues = (vehicle?: ApiVehicle | null): VehicleFormValues => {
  const brand = vehicle?.brand ?? '';
  const isKnownBrand = carBrands.includes(brand);
  const brandValue = brand && !isKnownBrand ? OTHER_VEHICLE_VALUE : brand;
  const availableModels = carModelsByBrand[brand] ?? [];
  const model = vehicle?.model ?? '';
  const isKnownModel = availableModels.includes(model);

  return {
    brand: brandValue,
    customBrand: brandValue === OTHER_VEHICLE_VALUE ? brand : '',
    model: model && !isKnownModel ? OTHER_VEHICLE_VALUE : model,
    customModel: model && !isKnownModel ? model : '',
    licensePlate: vehicle?.licensePlate ?? '',
    year: vehicle?.year ?? ('' as unknown as number),
    carType: vehicle?.carType ?? 'sedan',
  };
};

export function VehicleForm({
  formId,
  initialValue,
  existingImages = [],
  selectedFiles,
  isSubmitting,
  onFilesChange,
  onSubmit,
}: VehicleFormProps) {
  const defaultValues = useMemo(() => createDefaultValues(initialValue), [initialValue]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });

  const selectedBrand = useWatch({ control, name: 'brand' });
  const selectedModel = useWatch({ control, name: 'model' });
  const modelOptions = useMemo(
    () =>
      selectedBrand && selectedBrand !== OTHER_VEHICLE_VALUE
        ? (carModelsByBrand[selectedBrand] ?? [])
        : [],
    [selectedBrand]
  );

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!selectedBrand || selectedBrand === OTHER_VEHICLE_VALUE || !selectedModel) {
      return;
    }

    if (selectedModel !== OTHER_VEHICLE_VALUE && !modelOptions.includes(selectedModel)) {
      setValue('model', '');
      setValue('customModel', '');
    }
  }, [modelOptions, selectedBrand, selectedModel, setValue]);

  const resolveBrand = (values: VehicleFormValues) =>
    (values.brand === OTHER_VEHICLE_VALUE ? values.customBrand : values.brand)?.trim() ?? '';
  const resolveModel = (values: VehicleFormValues) =>
    (values.model === OTHER_VEHICLE_VALUE ? values.customModel : values.model)?.trim() ?? '';

  return (
    <form
      id={formId}
      className="grid gap-6"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          brand: resolveBrand(values),
          model: resolveModel(values),
          licensePlate: values.licensePlate.replace(/\s+/g, '').toUpperCase(),
          year: values.year,
          carType: values.carType,
          files: selectedFiles,
        })
      )}
    >
      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2 xl:gap-5">
          <Field>
            <FieldLabel>Hãng xe</FieldLabel>
            <select
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              disabled={isSubmitting}
              {...register('brand')}
            >
              <option value="">Chọn hãng xe</option>
              <optgroup label="Thương hiệu phổ biến">
                {popularCarBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tất cả thương hiệu">
                {carBrands
                  .filter((brand) => !popularCarBrands.includes(brand))
                  .map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
              </optgroup>
              <option value={OTHER_VEHICLE_VALUE}>Khác</option>
            </select>
            <FieldError>{errors.brand?.message}</FieldError>
            {selectedBrand === OTHER_VEHICLE_VALUE ? (
              <>
                <Input
                  className="h-11 rounded-xl bg-white"
                  placeholder="Nhập hãng xe"
                  disabled={isSubmitting}
                  {...register('customBrand')}
                />
                <FieldError>{errors.customBrand?.message}</FieldError>
              </>
            ) : null}
          </Field>

          <Field>
            <FieldLabel>Dòng xe</FieldLabel>
            <select
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={isSubmitting || !selectedBrand}
              {...register('model')}
            >
              <option value="">
                {!selectedBrand
                  ? 'Chọn hãng xe trước'
                  : modelOptions.length > 0
                    ? 'Chọn dòng xe'
                    : 'Chọn Khác để tự nhập'}
              </option>
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
              {selectedBrand ? <option value={OTHER_VEHICLE_VALUE}>Khác</option> : null}
            </select>
            <FieldError>{errors.model?.message}</FieldError>
            {selectedModel === OTHER_VEHICLE_VALUE ? (
              <>
                <Input
                  className="h-11 rounded-xl bg-white"
                  placeholder="Nhập dòng xe"
                  disabled={isSubmitting}
                  {...register('customModel')}
                />
                <FieldError>{errors.customModel?.message}</FieldError>
              </>
            ) : null}
          </Field>

          <FormInput
            label="Biển số xe"
            placeholder="VD: 70A-99999"
            error={errors.licensePlate?.message}
            disabled={isSubmitting}
            {...register('licensePlate')}
          />
          <Field>
            <FieldLabel>Năm sản xuất</FieldLabel>
            <select
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={isSubmitting}
              {...register('year', { valueAsNumber: true })}
            >
              <option value="">Chọn năm sản xuất</option>
              {productionYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <FieldError>{errors.year?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Loại xe</FieldLabel>
            <select
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={isSubmitting}
              {...register('carType')}
            >
              {carTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError>{errors.carType?.message}</FieldError>
          </Field>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <VehicleImageUploader
          existingImages={existingImages}
          selectedFiles={selectedFiles}
          disabled={isSubmitting}
          onChange={onFilesChange}
        />
      </section>
    </form>
  );
}

function FormInput({
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; error?: string }) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input className="h-11 rounded-xl bg-white" {...props} />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
