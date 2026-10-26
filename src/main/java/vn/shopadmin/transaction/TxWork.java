package vn.shopadmin.transaction;

import java.sql.Connection;
import java.sql.SQLException;

public interface TxWork<T> {
    T run(Connection conn) throws SQLException;
}
