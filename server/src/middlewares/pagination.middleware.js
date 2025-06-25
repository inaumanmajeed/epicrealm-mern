import ApiError from '../utils/ApiError.js';

/**
 * Pagination middleware that handles pagination logic
 * Extracts page and limit from query parameters
 * Adds pagination metadata to the request object
 */
export const pagination = (req, res, next) => {
  try {
    // Get page and limit from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate page and limit values
    if (page < 1) {
      throw new ApiError(400, 'Page number must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    // Calculate skip value for database query
    const skip = (page - 1) * limit;

    // Add pagination data to request object
    req.pagination = {
      page,
      limit,
      skip,
    };

    // Add helper function to create pagination response
    req.createPaginationResponse = (data, totalCount) => {
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data,
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
      };
    };

    next();
  } catch (error) {
    next(error);
  }
};
