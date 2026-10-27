<%@ include file="/WEB-INF/views/layout/taglibs.jspf" %>
<c:set var="pageTitle" value="Sản phẩm"/>
<c:set var="activeMenu" value="products"/>
<%@ include file="/WEB-INF/views/layout/header.jspf" %>
<%@ include file="/WEB-INF/views/layout/sidebar.jspf" %>
<%@ include file="/WEB-INF/views/layout/flash.jspf" %>

<%-- URL giữ bộ lọc (dùng cho link sắp xếp) --%>
<c:url var="filterUrl" value="/products">
    <c:param name="q" value="${param.q}"/>
    <c:param name="cat" value="${param.cat}"/>
    <c:param name="inStock" value="${param.inStock}"/>
    <c:param name="size" value="${param.size}"/>
</c:url>
<%-- URL giữ bộ lọc + sắp xếp (dùng cho phân trang) --%>
<c:url var="baseUrl" value="/products">
    <c:param name="q" value="${param.q}"/>
    <c:param name="cat" value="${param.cat}"/>
    <c:param name="inStock" value="${param.inStock}"/>
    <c:param name="size" value="${param.size}"/>
    <c:param name="sort" value="${param.sort}"/>
    <c:param name="dir" value="${param.dir}"/>
</c:url>
<c:set var="nextDir" value="${param.dir == 'asc' ? 'desc' : 'asc'}"/>

<div class="sa-page-header">
    <div>
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="${ctx}/dashboard">Tổng quan</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">Sản phẩm</li>
            </ol>
        </nav>
        <h1 class="sa-page-title">
            Sản phẩm <span class="text-muted-2 fs-6 fw-normal">(<fmt:formatNumber value="${page.totalItems()}"/>)</span>
        </h1>
    </div>
    <div class="d-flex gap-2">
        <c:url var="exportUrl" value="/products/export">
            <c:param name="q" value="${param.q}"/><c:param name="cat" value="${param.cat}"/><c:param name="stock" value="${param.stock}"/>
        </c:url>
        <a class="btn btn-outline-secondary btn-sm" href="${exportUrl}"><i class="bi bi-download me-1"></i>Xuất CSV</a>
        <c:if test="${sessionScope.currentUser.role == 'ADMIN' || sessionScope.currentUser.role == 'MANAGER'}">
            <a class="btn btn-primary btn-sm" href="${ctx}/products/new"><i class="bi bi-plus-lg me-1"></i>Thêm sản phẩm</a>
        </c:if>
    </div>
</div>

<div class="sa-card">
    <form class="sa-card-body sa-filter border-bottom" method="get" action="${ctx}/products">
        <div class="row g-2 align-items-end">
            <div class="col-md-4">
                <label class="form-label small text-muted-2" for="q">Từ khóa</label>
                <div class="input-group">
                    <span class="input-group-text bg-transparent"><i class="bi bi-search"></i></span>
                    <input class="form-control" id="q" name="q" type="search" value="${fn:escapeXml(param.q)}" placeholder="Tên hoặc SKU (gõ không dấu cũng được)">
                </div>
            </div>
            <div class="col-6 col-md-3">
                <label class="form-label small text-muted-2" for="cat">Danh mục</label>
                <select class="form-select" id="cat" name="cat" data-autosubmit>
                    <option value="">Tất cả danh mục</option>
                    <c:forEach items="${applicationScope.categories}" var="c">
                        <%-- So sánh dạng CHUỖI (fn:trim ép Long -> String) để ?cat=abc không gây ELException --%>
                        <option value="${c.id}" ${fn:trim(param.cat) == fn:trim(c.id) ? 'selected' : ''}><c:out value="${c.name}"/></option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-6 col-md-2">
                <label class="form-label small text-muted-2" for="stock">Tồn kho</label>
                <select class="form-select" id="stock" name="inStock" data-autosubmit>
                    <option value="">Tất cả</option>
                    <option value="1" ${param.inStock == '1' ? 'selected' : ''}>Còn hàng</option>
                </select>
            </div>
            <div class="col-md-3 d-flex gap-2">
                <button class="btn btn-primary flex-grow-1" type="submit">
                    <i class="bi bi-funnel me-1"></i>Lọc
                </button>
                <a class="btn btn-light" href="${ctx}/products" data-bs-toggle="tooltip" title="Xóa bộ lọc">
                    <i class="bi bi-x-lg"></i>
                </a>
            </div>
        </div>
    </form>

    <form id="bulkForm" class="sa-bulkbar align-items-center gap-2 px-3 py-2 bg-primary-subtle border-bottom" method="post" action="${ctx}/products/bulk"
          data-confirm="Áp dụng thao tác cho các sản phẩm đã chọn?">
        <input type="hidden" name="_csrf" value="${sessionScope.csrfToken}">
        <span class="small">Đã chọn <b class="js-bulk-count">0</b> sản phẩm</span>
        <select class="form-select form-select-sm ms-auto" name="action" style="width:auto">
            <option value="deactivate">Ngừng bán</option>
            <option value="activate">Mở bán lại</option>
        </select>
        <button class="btn btn-sm btn-primary" type="submit">Áp dụng</button>
    </form>

    <c:choose>
        <c:when test="${empty page.items()}">
            <div class="sa-empty">
                <i class="bi bi-inbox"></i>
                <c:choose>
                    <c:when test="${not empty param.q}">Không tìm thấy sản phẩm nào khớp "<c:out value="${param.q}"/>"</c:when>
                    <c:otherwise>Chưa có sản phẩm nào.</c:otherwise>
                </c:choose>
            </div>
        </c:when>
        <c:otherwise>
            <div class="table-responsive">
                <table class="table sa-table">
                    <thead>
                    <tr>
                        <th class="col-check"><input class="form-check-input js-check-all" type="checkbox" aria-label="Chọn tất cả"></th>
                        <th>Sản phẩm</th>
                        <th>SKU</th>
                        <th class="text-end">
                            <a class="sa-sort ${param.sort == 'price' ? 'active' : ''}" href="${filterUrl}&sort=price&dir=${param.sort == 'price' ? nextDir : 'asc'}">Giá bán
                                <i class="bi ${param.sort != 'price' ? 'bi-arrow-down-up small' : (param.dir == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill')}"></i></a>
                        </th>
                        <th class="text-center">
                            <a class="sa-sort ${param.sort == 'stock' ? 'active' : ''}" href="${filterUrl}&sort=stock&dir=${param.sort == 'stock' ? nextDir : 'asc'}">Tồn kho
                                <i class="bi ${param.sort != 'stock' ? 'bi-arrow-down-up small' : (param.dir == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill')}"></i></a>
                        </th>
                        <th>Trạng thái</th>
                        <th>
                            <a class="sa-sort ${param.sort == 'createdAt' ? 'active' : ''}" href="${filterUrl}&sort=createdAt&dir=${param.sort == 'createdAt' ? nextDir : 'desc'}">Ngày tạo
                                <i class="bi ${param.sort != 'createdAt' ? 'bi-arrow-down-up small' : (param.dir == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill')}"></i></a>
                        </th>
                        <th class="col-actions"></th>
                    </tr>
                    </thead>
                    <tbody>
                    <c:forEach items="${page.items()}" var="p">
                        <tr data-id="${p.id}" class="${p.stock == 0 ? 'row-out-of-stock' : ''}">
                            <td><input class="form-check-input js-check-row" type="checkbox" name="ids" value="${p.id}" form="bulkForm" aria-label="Chọn sản phẩm"></td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <c:choose>
                                        <c:when test="${not empty p.imageFile}"><img class="sa-thumb" src="${ctx}/media/products/${p.imageFile}" alt="" loading="lazy"></c:when>
                                        <c:otherwise><span class="sa-thumb"><i class="bi bi-image"></i></span></c:otherwise>
                                    </c:choose>
                                    <div class="min-w-0">
                                        <a class="fw-medium text-reset" href="${ctx}/products/edit?id=${p.id}"><c:out value="${p.name}"/></a>
                                        <div class="small text-muted-2"><c:out value="${p.categoryName}"/></div>
                                    </div>
                                </div>
                            </td>
                            <td><code class="text-body-secondary"><c:out value="${p.sku}"/></code></td>
                            <td class="text-end text-money"><fmt:formatNumber value="${p.price}" pattern="#,##0"/> ₫</td>
                            <td class="text-center">
                                <c:choose>
                                    <c:when test="${p.stock == 0}"><span class="badge text-bg-danger stock-badge">Hết hàng</span></c:when>
                                    <c:when test="${p.stock lt 10}"><span class="badge text-bg-warning stock-badge">${p.stock}</span></c:when>
                                    <c:otherwise><span class="badge bg-success-subtle text-success-emphasis stock-badge">${p.stock}</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td>
                                <span class="badge ${p.active ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}">${p.active ? 'Đang bán' : 'Ngừng bán'}</span>
                            </td>
                            <td class="small text-muted-2 tabular">${p.createdAtText}</td>
                            <td class="col-actions">
                                <a class="btn btn-sm btn-light" href="${ctx}/products/edit?id=${p.id}" data-bs-toggle="tooltip" title="Sửa"><i class="bi bi-pencil"></i></a>
                                <form class="d-inline" method="post" action="${ctx}/products/delete"
                                      data-confirm="Xóa sản phẩm &quot;${fn:escapeXml(p.name)}&quot;? Đơn hàng cũ vẫn giữ thông tin." data-confirm-ok="Xóa">
                                    <input type="hidden" name="_csrf" value="${sessionScope.csrfToken}">
                                    <input type="hidden" name="id" value="${p.id}">
                                    <button class="btn btn-sm btn-light text-danger" type="submit" data-bs-toggle="tooltip" title="Xóa"><i class="bi bi-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                    </c:forEach>
                    </tbody>
                </table>
            </div>
            <%@ include file="/WEB-INF/views/layout/pagination.jspf" %>
        </c:otherwise>
    </c:choose>
</div>

<%@ include file="/WEB-INF/views/layout/footer.jspf" %>