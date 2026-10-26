package vn.shopadmin.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

public final class DataSourceFactory {

    private DataSourceFactory() {
    }

    public static HikariDataSource create() {
        Properties p = loadProps("/db.properties");
        HikariConfig cfg = new HikariConfig();
        cfg.setDriverClassName("org.postgresql.Driver");
        cfg.setJdbcUrl(p.getProperty("db.url"));
        cfg.setUsername(p.getProperty("db.username"));
        cfg.setPassword(p.getProperty("db.password"));
        cfg.setMaximumPoolSize(Integer.parseInt(p.getProperty("db.pool.max")));

        cfg.setMinimumIdle(2);
        cfg.setConnectionTimeout(5000);
        cfg.setLeakDetectionThreshold(30000);
        cfg.setPoolName("shopadmin-pool");

        return new HikariDataSource(cfg);
    }

    private static Properties loadProps(String path) {
        Properties props = new Properties();
        try (InputStream in = DataSourceFactory.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IllegalArgumentException("Không tìm thấy file cấu hình " + path + " trong class path");
            }
            props.load(new InputStreamReader(in, StandardCharsets.UTF_8));
            return props;
        } catch (IOException e) {
            throw new IllegalArgumentException("Lỗi đọc file cấu hình " + path, e);
        }
    }
}
