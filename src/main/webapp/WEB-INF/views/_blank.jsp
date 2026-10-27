<%@ include file="/WEB-INF/views/layout/taglibs.jspf" %>
<c:set var="pageTitle" value="Tiêu đề trang"/>
<c:set var="activeMenu" value=""/>
<%@ include file="/WEB-INF/views/layout/header.jspf" %>
<%@ include file="/WEB-INF/views/layout/sidebar.jspf" %>
<%@ include file="/WEB-INF/views/layout/flash.jspf" %>

<div class="sa-page-header">
    <div>
        <nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="${ctx}/dashboard">Tổng quan</a></li><li class="breadcrumb-item active" aria-current="page">${pageTitle}</li></ol></nav>
        <h1 class="sa-page-title">${pageTitle}</h1>
    </div>
</div>

<div class="sa-card">
    <div class="sa-card-body">
        <%-- Dán nội dung từ file HTML tương ứng vào đây --%>
    </div>
</div>

<%@ include file="/WEB-INF/views/layout/footer.jspf" %>
