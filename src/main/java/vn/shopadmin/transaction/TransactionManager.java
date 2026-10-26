package vn.shopadmin.transaction;

import vn.shopadmin.dao.DataAccessException;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class TransactionManager {
    private final DataSource ds;

    public TransactionManager(DataSource ds) {
        this.ds = ds;
    }

    public <T> T inTransaction(TxWork<T> work) {
        try (Connection conn = ds.getConnection()) {
            conn.setAutoCommit(false);
            try {
                T result = work.run(conn);
                conn.commit();
                return result;
            } catch (SQLException | RuntimeException e) {
                conn.rollback();
                if (e instanceof RuntimeException re) {
                    throw re;
                }
                throw new DataAccessException("Lỗi transaction", e);
            }
        } catch (SQLException e) {
            throw new DataAccessException("Không lấy được kết nối", e);
        }
    }
}
