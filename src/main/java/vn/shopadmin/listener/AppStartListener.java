package vn.shopadmin.listener;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import vn.shopadmin.dao.CategoryDAO;
import vn.shopadmin.util.DataSourceFactory;

import javax.sql.DataSource;
import java.util.List;

@WebListener
public class AppStartListener implements ServletContextListener {
    private static final Logger log = LoggerFactory.getLogger(AppStartListener.class.getName());

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();

        // Connetion Pool
        DataSource ds = DataSourceFactory.create();
        ctx.setAttribute("datasource", ds);

        ctx.setAttribute("categories", new CategoryDAO(ds).findAllActive());

        log.info("ShopAdmin khởi động xong - {} danh mục", ((List<?>) ctx.getAttribute("categories")).size());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        Object ds = sce.getServletContext().getAttribute("datasource");

        if (ds instanceof AutoCloseable c) {
            try {
                c.close();
            } catch (Exception e) {
                log.warn("Lỗi đóng pool", e);
            }
        }
        log.info("ShopAdmin đã tắt, đóng connection pool");
    }
}
