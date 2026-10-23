package vn.shopadmin.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Logger;

@WebServlet(urlPatterns = "/lifecycle", loadOnStartup = 1)
public class LifeCycleServlet extends HttpServlet {

    private static final Logger log = Logger.getLogger(LifeCycleServlet.class.getName());
    private static final AtomicLong counter = new AtomicLong();

    public LifeCycleServlet() {
        log.info("1) Constructor — thread: " + Thread.currentThread().getName());
    }

    @Override
    public void init() throws ServletException {
        log.info("2) init() — chỉ gọi 1 lần. Nạp cấu hình, cache danh mục...");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        long n = counter.incrementAndGet();
        log.info("3) doGet lần " + n + " — thread: " + Thread.currentThread().getName());
        resp.getWriter().println("Request thứ " + n);
    };

    @Override
    public void destroy() {
        log.info("4) destroy() — dọn dẹp: đóng file, dừng scheduler...");
    };
}
