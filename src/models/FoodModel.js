export const MSSV_PREFIX = "BIT247634_";

export const createCategory = (id, name, description) => ({
  [`${MSSV_PREFIX}Id`]: id,
  [`${MSSV_PREFIX}Name`]: name,
  [`${MSSV_PREFIX}Description`]: description,
});

export const createDish = (id, name, price, preparationTime, isAvailable, description, dishCategoryId, images) => ({
  [`${MSSV_PREFIX}Id`]: id,
  [`${MSSV_PREFIX}Name`]: name,
  [`${MSSV_PREFIX}Price`]: price,
  [`${MSSV_PREFIX}PreparationTime`]: preparationTime,
  [`${MSSV_PREFIX}IsAvailable`]: isAvailable,
  [`${MSSV_PREFIX}Description`]: description,
  [`${MSSV_PREFIX}DishCategoryId`]: dishCategoryId,
  [`${MSSV_PREFIX}DishImage`]: images, // Danh sách ảnh gồm ImageUrl, IsThumbnail
});