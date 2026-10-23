package vn.shopadmin.listener;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import vn.shopadmin.util.DataSourceFactory;

import javax.sql.DataSource;
import java.util.logging.Logger;

public class AppStartListener implements ServletContextListener {
    private static final Logger log = Logger.getLogger(AppStartListener.class.getName());

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();

        // Connetion Pool
        DataSource ds = DataSourceFactory.create();
        ctx.setAttribute("datasource", ds);

//        ctx.setAttribute("categories", new CategoryDao(ds).findAllActive());
//        ctx.setAttribute("orderStatuses", OrderStatus.values());

//        log.info("ShopAdmin khởi động xong — {} danh mục", ((List<?>) ctx.getAttribute("categories")).size());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        Object ds = sce.getServletContext().getAttribute("datasource");

        if (ds instanceof AutoCloseable c) {
            try {
                c.close();
            } catch (Exception e) {
//                log.warning("Lỗi đóng pool", e);
            }
        }
        log.info("ShopAdmin đã tắt, đóng connection pool");
    }
}
