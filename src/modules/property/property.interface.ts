export type TPropertyFilters = {
  searchTerm?: string;
  city?: string;
  area?: string;
  type?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  bedrooms?: string | number;
  categoryId?: string;
};

export const propertyFilterableFields = [
  "searchTerm",
  "city",
  "area",
  "type",
  "minPrice",
  "maxPrice",
  "bedrooms",
  "categoryId",
];

export const propertySearchableFields = ["title", "description", "city", "area", "address"];