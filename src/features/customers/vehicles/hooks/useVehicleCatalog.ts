import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import {
  carBrands,
  carModelsByBrand,
} from '@/features/customers/vehicles/data/car-catalog';
import { vehiclesApi } from '@/services/vehicleService';
import type { VehicleBrand, VehicleModel } from '@/types/vehicle';

export interface CatalogModel {
  /** Present when the model comes from the backend catalog. */
  id?: string;
  name: string;
}

export interface CatalogBrand {
  /** Present when the brand comes from the backend catalog. */
  id?: string;
  name: string;
  isNew?: boolean;
  models?: CatalogModel[];
}

const fallbackModels = (brandName: string): CatalogModel[] =>
  (carModelsByBrand[brandName] ?? []).map((name) => ({ name }));

const uniqueByName = (models: CatalogModel[]): CatalogModel[] => {
  const seen = new Set<string>();
  return models.filter((model) => {
    if (seen.has(model.name)) return false;
    seen.add(model.name);
    return true;
  });
};

/**
 * Loads the vehicle brand catalog from the API and merges it with the
 * hardcoded car-catalog list. The hardcoded list is used as a fallback for
 * brands the API does not know (and entirely when the API is unavailable).
 */
export function useVehicleBrands() {
  const brandsQuery = useQuery({
    queryKey: queryKeys.vehicleCatalog.brands(),
    queryFn: ({ signal }) => vehiclesApi.getVehicleBrands(signal),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const brands = useMemo<CatalogBrand[]>(() => {
    const apiBrands: CatalogBrand[] = (brandsQuery.data ?? []).map((brand: VehicleBrand) => ({
      id: brand._id,
      name: brand.name,
      isNew: brand.isNew ?? false,
      models: (brand.models ?? []).map((model: VehicleModel) => ({
        id: model._id,
        name: model.name,
      })),
    }));

    if (apiBrands.length || !brandsQuery.isError) {
      return apiBrands;
    }

    return carBrands.map((name) => ({ name }));
  }, [brandsQuery.data, brandsQuery.isError]);

  return {
    brands,
    isCatalogLoading: brandsQuery.isLoading,
    isCatalogError: brandsQuery.isError,
  };
}

/**
 * Loads the models for a catalog brand from the API. Only enabled when the
 * brand is a backend catalog brand AND its models were not already embedded
 * in the brands response.
 */
export function useVehicleModels(brandId?: string) {
  const modelsQuery = useQuery({
    queryKey: queryKeys.vehicleCatalog.models(brandId ?? ''),
    queryFn: ({ signal }) => vehiclesApi.getVehicleModels(brandId as string, signal),
    enabled: Boolean(brandId),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const models = useMemo<CatalogModel[]>(
    () => (modelsQuery.data ?? []).map((model: VehicleModel) => ({ id: model._id, name: model.name })),
    [modelsQuery.data]
  );

  return {
    models,
    isModelsLoading: modelsQuery.isLoading,
    isModelsError: modelsQuery.isError,
  };
}

export const fallbackModelsForBrand = fallbackModels;

export const fallbackAllModels = (): CatalogModel[] =>
  uniqueByName(Object.values(carModelsByBrand).flat().map((name) => ({ name })));

export const allModelsFromBrands = (brands: CatalogBrand[]): CatalogModel[] =>
  uniqueByName([
    ...brands.flatMap((brand) => brand.models ?? []),
    ...fallbackAllModels(),
  ]);
