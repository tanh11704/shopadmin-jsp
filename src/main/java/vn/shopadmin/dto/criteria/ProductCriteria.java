package vn.shopadmin.dto.criteria;

import jakarta.servlet.http.HttpServletRequest;
import vn.shopadmin.util.ParamUtil;

import java.util.Optional;

public class ProductCriteria {
    private String keyword;
    private Long categoryId;
    private Boolean inStock;
    private String sort = "createdAt";
    private String dir = "desc";
    private int page = 1;
    private int size = 20;

    public static ProductCriteria from(HttpServletRequest req) {
        ProductCriteria c = new ProductCriteria();
        c.keyword = ParamUtil.str(req, "q");
        String cat = ParamUtil.str(req, "cat");
        c.categoryId = cat == null ? null : Long.valueOf(cat);
        c.inStock = "1".equals(req.getParameter("inStock")) ? Boolean.TRUE : null;
        c.sort = Optional.ofNullable(ParamUtil.str(req, "sort")).orElse("createdAt");
        c.dir = "asc".equalsIgnoreCase(req.getParameter("dir")) ? "asc" : "desc";
        c.page = Math.max(1, ParamUtil.intOr(req, "page", 1));
        c.size = Math.clamp(ParamUtil.intOr(req, "size", 20), 5, 100);
        return c;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
