package vn.shopadmin.config;

import vn.shopadmin.dao.CategoryDAO;
import vn.shopadmin.dao.ProductDAO;
import vn.shopadmin.service.ProductService;
import vn.shopadmin.transaction.TransactionManager;

import javax.sql.DataSource;

public class AppContext {
    private static ProductService productService;

    public static void init(DataSource ds) {
        var productDAO = new ProductDAO(ds);
        var categoryDAO = new CategoryDAO(ds);
        var tx = new TransactionManager(ds);
        productService = new ProductService(productDAO);
    }

    public static ProductService productService() {
        return productService;
    }
}
