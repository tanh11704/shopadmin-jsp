<%@ include file="/WEB-INF/views/layout/taglibs.jspf" %>
<!DOCTYPE html>
<html lang="vi" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hệ thống gặp sự cố · ShopAdmin</title>
  <link rel="icon" href="${ctx}/assets/img/favicon.svg" type="image/svg+xml">
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="${ctx}/assets/css/app.css">
</head>
<body class="sa-body">
  <main class="sa-error">
    <div style="max-width: 480px">
      <div class="sa-error-code">500</div>
      <h1 class="h3 fw-bold mt-2">Hệ thống gặp sự cố</h1>
      <p class="text-muted-2">Đã có lỗi khi xử lý yêu cầu của bạn. Đội kỹ thuật đã được ghi nhận.</p>
      <c:if test="${not empty errorId}">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-body-tertiary small">
          Mã lỗi: <code class="fs-6"><c:out value="${errorId}"/></code>
        </div>
        <p class="small text-muted-2 mt-2">Khi báo lỗi cho IT, vui lòng gửi kèm mã này.</p>
      </c:if>
      <div class="d-flex gap-2 justify-content-center mt-4">
        <a class="btn btn-light" href="javascript:history.back()"><i class="bi bi-arrow-left me-1"></i>Quay lại</a>
        <a class="btn btn-primary" href="${ctx}/dashboard"><i class="bi bi-house me-1"></i>Về trang chủ</a>
      </div>
    </div>
  </main>
</body>
</html>
