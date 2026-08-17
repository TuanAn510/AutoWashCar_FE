import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
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
import { OTHER_VEHICLE_VALUE } from '@/features/customers/vehicles/data/car-catalog';
import {
  type CatalogBrand,
  fallbackModelsForBrand,
  useVehicleBrands,
  useVehicleModels,
} from '@/features/customers/vehicles/hooks/useVehicleCatalog';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

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
const commonModelOptions: Array<{ id?: string; name: string }> = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Pickup',
  'MPV',
  'Crossover',
].map((name) => ({ name }));

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
        'Biển số xe không đúng định dạng. Ví dụ: 70A99999.'
      ),
    year: z
      .number({ message: 'Vui lòng nhập năm sản xuất.' })
      .int('Năm sản xuất phải là số nguyên.')
      .min(1900, 'Năm sản xuất không hợp lệ.')
      .max(currentYear, 'Năm sản xuất không được lớn hơn năm hiện tại.'),
    carType: z.enum(['sedan', 'suv', 'pickup'], { message: 'Vui lòng chọn loại xe.' }),
  })
  .superRefine((values, ctx) => {
    if (values.brand === OTHER_VEHICLE_VALUE) {
      if (!values.customBrand?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customBrand'],
          message: 'Vui lòng nhập hãng xe.',
        });
      }

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

const createDefaultValues = (
  vehicle: ApiVehicle | null | undefined,
  brands: CatalogBrand[]
): VehicleFormValues => {
  const brand = vehicle?.brand ?? '';
  const isKnownBrand = brands.some((option) => option.name === brand);
  const brandValue = brand && !isKnownBrand ? OTHER_VEHICLE_VALUE : brand;
  const brandOption = brands.find((option) => option.name === brand);
  const knownModels = brandOption?.models?.length ? brandOption.models : fallbackModelsForBrand(brand);
  const model = vehicle?.model ?? '';
  const isKnownModel = knownModels.some((option) => option.name === model);

  return {
    brand: brandValue,
    customBrand: brandValue === OTHER_VEHICLE_VALUE ? brand : '',
    model: model && !isKnownModel ? OTHER_VEHICLE_VALUE : model,
    customModel: model && !isKnownModel ? model : '',
    licensePlate: vehicle?.licensePlate ? formatLicensePlateDisplay(vehicle.licensePlate) : '',
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
  const { brands } = useVehicleBrands();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {},
  });
  const hasMounted = useRef(false);

  const selectedBrand = useWatch({ control, name: 'brand' });
  const selectedModel = useWatch({ control, name: 'model' });

  const selectedBrandOption = useMemo(
    () => brands.find((option) => option.name === selectedBrand) ?? null,
    [brands, selectedBrand]
  );
  const needsApiModels = Boolean(selectedBrandOption?.id) && !selectedBrandOption?.models?.length;
  const { models: fetchedModels } = useVehicleModels(
    needsApiModels ? selectedBrandOption?.id : undefined
  );
  const modelOptions = useMemo(() => {
    if (selectedBrand === OTHER_VEHICLE_VALUE) return commonModelOptions;
    if (!selectedBrand || !selectedBrandOption) return [];
    if (selectedBrandOption.models?.length) return selectedBrandOption.models;
    if (selectedBrandOption.id) return fetchedModels;
    return fallbackModelsForBrand(selectedBrand);
  }, [selectedBrand, selectedBrandOption, fetchedModels]);

  const defaultValues = useMemo(
    () => createDefaultValues(initialValue, brands),
    [initialValue, brands]
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      reset(defaultValues);
      return;
    }

    // Re-resolve defaults when the catalog/models finish loading, but never
    // overwrite values the user has already edited.
    if (!isDirty) {
      reset(defaultValues);
    }
  }, [defaultValues, isDirty, reset]);

  useEffect(() => {
    if (!selectedBrand || !selectedModel || selectedModel === OTHER_VEHICLE_VALUE) {
      return;
    }

    if (!modelOptions.some((option) => option.name === selectedModel)) {
      setValue('model', '');
      setValue('customModel', '');
    }
  }, [modelOptions, selectedBrand, selectedModel, setValue]);

  const resolveBrand = (values: VehicleFormValues) =>
    (values.brand === OTHER_VEHICLE_VALUE ? values.customBrand : values.brand)?.trim() ?? '';
  const resolveModel = (values: VehicleFormValues) =>
    (values.model === OTHER_VEHICLE_VALUE ? values.customModel : values.model)?.trim() ?? '';

  const submitForm = (values: VehicleFormValues) => {
    const selectedModelOption = modelOptions.find((option) => option.name === values.model) ?? null;

    onSubmit({
      brand: resolveBrand(values),
      model: resolveModel(values),
      ...(values.brand !== OTHER_VEHICLE_VALUE && selectedBrandOption?.id
        ? { brandId: selectedBrandOption.id }
        : {}),
      ...(values.model !== OTHER_VEHICLE_VALUE && selectedModelOption?.id
        ? { modelId: selectedModelOption.id }
        : {}),
      ...(values.brand === OTHER_VEHICLE_VALUE && values.customBrand?.trim()
        ? { suggestedBrandName: values.customBrand.trim() }
        : {}),
      ...(values.model === OTHER_VEHICLE_VALUE && values.customModel?.trim()
        ? { suggestedModelName: values.customModel.trim() }
        : {}),
      licensePlate: formatLicensePlateDisplay(values.licensePlate),
      year: values.year,
      carType: values.carType,
      files: selectedFiles,
    });
  };

  return (
    <form
      id={formId}
      className="grid gap-6"
      onSubmit={handleSubmit(submitForm)}
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
              {brands.map((brand) => (
                <option key={brand.id ?? brand.name} value={brand.name}>
                  {brand.name}
                </option>
              ))}
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
              disabled={isSubmitting}
              {...register('model')}
            >
              <option value="">Chọn dòng xe</option>
              {modelOptions.map((model) => (
                <option key={model.id ?? model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
              <option value={OTHER_VEHICLE_VALUE}>Khác</option>
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
            {...register('licensePlate', {
              onChange: (event) => {
                setValue('licensePlate', formatLicensePlateDisplay(event.target.value), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              },
            })}
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
