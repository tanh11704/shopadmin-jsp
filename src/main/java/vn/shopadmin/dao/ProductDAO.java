package vn.shopadmin.dao;

import vn.shopadmin.common.pagination.Page;
import vn.shopadmin.dto.ProductListItem;
import vn.shopadmin.dto.criteria.ProductCriteria;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ProductDAO {
    private final DataSource ds;

    public ProductDAO(DataSource ds) {
        this.ds = ds;
    }

    public static final Map<String, String> SORTABLE = Map.of(
            "name", "p.name",
            "price", "p.price",
            "stock", "p.stock",
            "createdAt", "p.created_at"
    );

    public Page<ProductListItem> search(ProductCriteria c) {
        StringBuilder where = new StringBuilder(" WHERE p.active = TRUE");
        List<Object> params = new ArrayList<>();

        if (c.getKeyword() != null) {
            where.append(" AND (p.name_search LIKE ? OR p.sku LIKE ?)");
            String like = "%" + escapeLike(c.getKeyword()) + "%";
            params.add(like);
            params.add(like);
        }

        if (c.getCategoryId() != null) {
            where.append(" AND p.category_id = ?");
            params.add(c.getCategoryId());
        }

        if (Boolean.TRUE.equals(c.getInStock())) {
            where.append(" AND p.stock > 0");
        }

        String orderBy = " ORDER BY " + SORTABLE.getOrDefault(c.getSort(), "c.created_at")
                + ("asc".equals(c.getDir()) ? " ASC" : " DESC") + ", p.id DESC";

        String countSql = "SELECT COUNT(*) FROM product p" + where;
        String dataSql = "SELECT p.id, p.sku, p.name AS product_name, p.price, p.stock, p.category_id, p.image_file, p.active, p.created_at, "
                + "c.name AS category_name FROM product p "
                + "LEFT JOIN category c ON c.id = p.category_id"
                + where + orderBy + " LIMIT ? OFFSET ?";

        try (Connection conn = ds.getConnection()) {
            int total;
            try (PreparedStatement ps = conn.prepareStatement(countSql)) {
                bind(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    total = rs.getInt(1);
                }
            }

            List<ProductListItem> items = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(dataSql)) {
                bind(ps, params);
                ps.setInt(params.size() + 1, c.getSize());
                ps.setInt(params.size() + 2, (c.getPage() - 1) * c.getSize());
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        items.add(map(rs));
                    }
                    return new Page<>(items, c.getPage(), c.getSize(), total);
                }
            }
        } catch (SQLException e) {
            throw new DataAccessException("Có lỗi khi tìm kiếm sản phẩm", e);
        }
    }

    private ProductListItem map(ResultSet rs) throws SQLException {
        ProductListItem p = new ProductListItem();
        p.setId(rs.getLong("id"));
        p.setSku(rs.getString("sku"));
        p.setName(rs.getString("product_name"));
        p.setPrice(rs.getLong("price"));
        p.setStock(rs.getInt("stock"));
        p.setCategoryName(rs.getString("category_name"));
        p.setActive(rs.getBoolean("active"));
        p.setImageFile(rs.getString("image_file"));
        p.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
        return p;
    }

    private static void bind(PreparedStatement ps, List<Object> params) throws SQLException {
        for (int i = 0; i < params.size(); i++) {
            ps.setObject(i + 1, params.get(i));
        }
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
