package vn.shopadmin.service;

import vn.shopadmin.common.pagination.Page;
import vn.shopadmin.dao.ProductDAO;
import vn.shopadmin.dto.ProductListItem;
import vn.shopadmin.dto.criteria.ProductCriteria;

public class ProductService {
    private final ProductDAO productDAO;

    public ProductService(ProductDAO productDAO) {
        this.productDAO = productDAO;
    }

    public Page<ProductListItem> search(ProductCriteria criteria) {
        return productDAO.search(criteria);
    }
}
