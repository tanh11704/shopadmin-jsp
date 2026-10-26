package vn.shopadmin.dao;

import vn.shopadmin.model.Category;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CategoryDAO {

    private final DataSource ds;

    public CategoryDAO(DataSource ds) {
        this.ds = ds;
    }

    private static final String SELECT_COLS = "SELECT id, name, active FROM category ";

    public List<Category> findAllActive() {
        String sql = SELECT_COLS + "WHERE active = TRUE ORDER BY name";
        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Category> result = new ArrayList<>();
            while (rs.next()) {
                Category c = map(rs);
                result.add(c);
            }
            return result;
        } catch (SQLException e) {
            throw new DataAccessException("Lỗi lấy danh mục đang hoạt động", e);
        }
    }

    private Category map(ResultSet rs) throws SQLException {
        Category c = new Category();
        c.setId(rs.getInt("id"));
        c.setName(rs.getString("name"));
        c.setActive(rs.getBoolean("active"));
        return c;
    }
}
