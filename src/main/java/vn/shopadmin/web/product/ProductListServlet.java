package vn.shopadmin.web.product;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import vn.shopadmin.common.pagination.Page;
import vn.shopadmin.config.AppContext;
import vn.shopadmin.dto.ProductListItem;
import vn.shopadmin.dto.criteria.ProductCriteria;
import vn.shopadmin.service.ProductService;

import java.io.IOException;

@WebServlet("/products")
public class ProductListServlet extends HttpServlet {

    private ProductService productService;

    @Override
    public void init() throws ServletException {
        productService = AppContext.productService();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ProductCriteria criteria = ProductCriteria.from(req);
        Page<ProductListItem> page = productService.search(criteria);
        req.setAttribute("page", page);
        req.setAttribute("criteria", criteria);
        req.getRequestDispatcher("/WEB-INF/views/product/list.jsp").forward(req, resp);
    }
}
