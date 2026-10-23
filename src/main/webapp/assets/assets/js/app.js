/* =====================================================================
   ShopAdmin UI — app.js (jQuery 3 + Bootstrap 5)
   Copy vào: src/main/webapp/assets/js/app.js

   Cấu hình: trong JSP (footer.jspf) đặt TRƯỚC file này:
     <script>
       window.SA_CONFIG = { ctx: '${ctx}', csrfToken: '${sessionScope.csrfToken}', demo: false };
     </script>
   Khi mở file HTML tĩnh (file://) => tự bật demo: AJAX được giả lập, không cần server.

   Mọi tính năng gắn bằng data-attribute, không cần viết JS riêng cho từng trang:
     form[data-confirm]          hộp xác nhận trước khi submit (xóa, hủy, khóa…)
     form.needs-validation       kiểm tra HTML5 + chặn bấm "Lưu" 2 lần
     input[data-money]           tự định dạng 1.250.000 khi gõ
     input[data-check-url]       kiểm tra trùng (SKU, username…) qua AJAX, debounce
     input[data-preview]         xem trước ảnh trước khi upload
     [data-counter]              đếm ký tự cho input/textarea có maxlength
     select[data-autosubmit]     đổi bộ lọc là submit form
     select.js-order-status      đổi trạng thái đơn bằng AJAX
     [data-theme-toggle]         chuyển sáng/tối
     #revenueChart               biểu đồ doanh thu (Chart.js)
     #orderForm                  tạo đơn: thêm/xóa dòng, tính tiền
   ===================================================================== */
(function ($) {
  'use strict';

  var SA = window.SA = window.SA || {};
  SA.config = $.extend({
    ctx: '',
    csrfToken: '',
    demo: location.protocol === 'file:'
  }, window.SA_CONFIG || {});

  /* ---------------------------------------------------------------
     Tiện ích
     --------------------------------------------------------------- */
  SA.url = function (path) { return SA.config.ctx + path; };

  SA.formatNumber = function (n) {
    return (Number(n) || 0).toLocaleString('vi-VN');
  };
  SA.formatMoney = function (n) { return SA.formatNumber(n) + ' ₫'; };
  /** "1.250.000 ₫" | "1,250,000" -> 1250000 */
  SA.parseMoney = function (s) {
    var digits = String(s == null ? '' : s).replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };
  SA.escapeHtml = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  SA.debounce = function (fn, ms) {
    var t;
    return function () {
      var self = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  };
  SA.storage = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }
  };

  /* ---------------------------------------------------------------
     Toast thông báo:  SA.toast('Đã lưu', 'success' | 'danger' | 'warning' | 'info')
     --------------------------------------------------------------- */
  SA.toast = function (message, type) {
    type = type || 'success';
    var icons = { success: 'check-circle-fill', danger: 'x-circle-fill', warning: 'exclamation-triangle-fill', info: 'info-circle-fill' };
    var $box = $('#saToastContainer');
    if (!$box.length) {
      $box = $('<div id="saToastContainer" class="toast-container sa-toast-container position-fixed top-0 end-0 p-3"></div>').appendTo('body');
    }
    var $t = $(
      '<div class="toast align-items-center border-0 text-bg-' + type + '" role="alert" aria-live="assertive" aria-atomic="true">' +
        '<div class="d-flex"><div class="toast-body"><i class="bi bi-' + icons[type] + ' me-2"></i>' + SA.escapeHtml(message) + '</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button></div>' +
      '</div>'
    ).appendTo($box);
    var toast = new bootstrap.Toast($t[0], { delay: 3500 });
    $t.on('hidden.bs.toast', function () { $t.remove(); });
    toast.show();
  };

  /* ---------------------------------------------------------------
     Hộp xác nhận (thay cho window.confirm xấu xí)
     SA.confirm({ title, message, okText, okClass }).then(function(){ ... })
     --------------------------------------------------------------- */
  SA.confirm = function (opts) {
    opts = $.extend({ title: 'Xác nhận', message: 'Bạn có chắc chắn?', okText: 'Đồng ý', okClass: 'btn-danger' }, opts);
    var $m = $('#saConfirmModal');
    if (!$m.length) {
      $m = $(
        '<div class="modal fade" id="saConfirmModal" tabindex="-1" aria-hidden="true">' +
          '<div class="modal-dialog modal-dialog-centered modal-sm"><div class="modal-content">' +
            '<div class="modal-body text-center p-4">' +
              '<div class="fs-1 text-warning mb-2"><i class="bi bi-exclamation-circle"></i></div>' +
              '<h5 class="js-title mb-2"></h5><p class="js-message text-muted-2 mb-0"></p>' +
            '</div>' +
            '<div class="modal-footer border-0 pt-0 justify-content-center">' +
              '<button type="button" class="btn btn-light" data-bs-dismiss="modal">Hủy bỏ</button>' +
              '<button type="button" class="btn js-ok"></button>' +
            '</div>' +
          '</div></div>' +
        '</div>'
      ).appendTo('body');
    }
    $m.find('.js-title').text(opts.title);
    $m.find('.js-message').text(opts.message);
    $m.find('.js-ok').attr('class', 'btn js-ok ' + opts.okClass).text(opts.okText);

    var d = $.Deferred();
    var modal = bootstrap.Modal.getOrCreateInstance($m[0]);
    $m.find('.js-ok').off('click').on('click', function () { d.resolve(); modal.hide(); });
    $m.off('hidden.bs.modal.sa').on('hidden.bs.modal.sa', function () { if (d.state() === 'pending') d.reject(); });
    modal.show();
    return d.promise();
  };

  /* ---------------------------------------------------------------
     AJAX: tự gắn CSRF token, xử lý 401/403/lỗi chung
     --------------------------------------------------------------- */
  $.ajaxSetup({
    headers: { 'X-CSRF-Token': SA.config.csrfToken, 'X-Requested-With': 'XMLHttpRequest' }
  });
  $(document).ajaxError(function (e, xhr, settings) {
    if (settings.saSilent) return;
    if (xhr.status === 401) {
      SA.toast('Phiên đăng nhập đã hết hạn. Đang chuyển về trang đăng nhập…', 'warning');
      setTimeout(function () {
        location.href = SA.url('/login?next=' + encodeURIComponent(location.pathname + location.search));
      }, 1500);
      return;
    }
    var msg = (xhr.responseJSON && xhr.responseJSON.message) ||
              (xhr.status === 403 ? 'Bạn không có quyền thực hiện thao tác này.' : 'Có lỗi xảy ra, vui lòng thử lại.');
    SA.toast(msg, 'danger');
  });

  /** Gửi JSON:  SA.postJson('/api/orders/88/status', {status:'DELIVERED'}) */
  SA.postJson = function (path, body) {
    return $.ajax({ url: SA.url(path), method: 'POST', contentType: 'application/json; charset=UTF-8',
                    data: JSON.stringify(body), dataType: 'json' });
  };

  /** Giả lập server khi demo (mở HTML tĩnh) */
  SA.fake = function (data, failMessage) {
    var d = $.Deferred();
    setTimeout(function () {
      if (failMessage) {
        SA.toast(failMessage, 'danger');
        d.reject({ status: 409, responseJSON: { message: failMessage } });
      } else d.resolve(data);
    }, 350);
    return d.promise();
  };

  /* ---------------------------------------------------------------
     Giao diện sáng / tối
     --------------------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    $('[data-theme-toggle] i').attr('class', theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars');
  }
  applyTheme(SA.storage.get('sa-theme') || 'light');
  $(document).on('click', '[data-theme-toggle]', function () {
    var next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    SA.storage.set('sa-theme', next);
    applyTheme(next);
    $(document).trigger('sa:theme', next);
  });

  /* ---------------------------------------------------------------
     Form: xác nhận, validate, chặn double-submit
     --------------------------------------------------------------- */
  $(document).on('submit', 'form[data-confirm]', function (e) {
    var form = this, $f = $(form);
    if ($f.data('confirmed')) return; // đã xác nhận => cho submit
    e.preventDefault();
    SA.confirm({
      title: $f.data('confirm-title') || 'Xác nhận',
      message: $f.data('confirm'),
      okText: $f.data('confirm-ok') || 'Đồng ý',
      okClass: $f.data('confirm-class') || 'btn-danger'
    }).then(function () {
      $f.data('confirmed', true);
      if (SA.config.demo) { SA.toast('(Demo) Đã gửi form: ' + ($f.attr('action') || ''), 'info'); $f.data('confirmed', false); return; }
      form.submit();
    });
  });

  $(document).on('submit', 'form', function (e) {
    var form = this, $f = $(form);
    if ($f.is('[data-confirm]') && !$f.data('confirmed')) return;

    if ($f.hasClass('needs-validation') && !form.checkValidity()) {
      e.preventDefault(); e.stopPropagation();
      $f.addClass('was-validated');
      var $first = $f.find(':invalid').first();
      if ($first.length) $first.trigger('focus');
      return;
    }
    if (SA.config.demo && !$f.is('[data-demo-allow]')) {
      e.preventDefault();
      SA.toast('(Demo) Form sẽ gửi ' + ($f.attr('method') || 'GET').toUpperCase() + ' ' + ($f.attr('action') || ''), 'info');
      return;
    }
    // Chặn double-click "Lưu" (PRG chống F5, cái này chống bấm 2 lần)
    var $btns = $f.find('button[type=submit], button:not([type])').add('button[type=submit][form="' + form.id + '"]');
    $btns.prop('disabled', true).each(function () {
      var $b = $(this);
      if (!$b.find('.spinner-border').length) $b.prepend('<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>');
    });
  });

  // Lỗi do SERVER trả về (class is-invalid có sẵn trong HTML): người dùng sửa ô đó thì bỏ tô đỏ
  $(document).on('input change', 'input.is-invalid:not(.js-qty):not([data-check-url]), select.is-invalid, textarea.is-invalid', function () {
    $(this).removeClass('is-invalid');
  });

  // Đổi bộ lọc => submit
  $(document).on('change', 'select[data-autosubmit], input[data-autosubmit]', function () {
    $(this).closest('form').trigger('submit');
  });

  /* ---------------------------------------------------------------
     Ô tiền: gõ 1250000 -> hiển thị 1.250.000
     Server (ProductForm.parseMoney) đã bỏ dấu chấm/phẩy nên gửi nguyên chuỗi được.
     --------------------------------------------------------------- */
  $(document).on('input', 'input[data-money]', function () {
    var el = this, raw = SA.parseMoney(el.value);
    el.value = raw ? SA.formatNumber(raw) : '';
    el.setSelectionRange && el.setSelectionRange(el.value.length, el.value.length);
  });

  /* Đếm ký tự */
  function updateCounter(el) {
    var max = el.getAttribute('maxlength');
    $('#' + el.getAttribute('data-counter')).text(el.value.length + '/' + max);
  }
  $(document).on('input', '[data-counter]', function () { updateCounter(this); });

  /* ---------------------------------------------------------------
     Kiểm tra trùng qua AJAX (SKU, username…)
     <input data-check-url="/api/products/check-sku" data-check-param="sku">
     Server trả: { "available": true|false }
     --------------------------------------------------------------- */
  $(document).on('input', 'input[data-check-url]', SA.debounce(function () {
    var $in = $(this), val = $.trim($in.val());
    var $hint = $('#' + $in.data('check-hint'));
    $in.removeClass('is-valid is-invalid border-danger');
    if (val.length < 3) { $hint.text(''); return; }
    $hint.attr('class', 'form-text').html('<span class="spinner-border spinner-border-sm"></span> Đang kiểm tra…');

    var req = SA.config.demo
      ? SA.fake({ available: val.toUpperCase() !== 'AT-BASIC-TRANG-M' })
      : $.getJSON(SA.url($in.data('check-url')), (function () { var p = {}; p[$in.data('check-param') || 'value'] = val; return p; })());

    req.done(function (res) {
      if (res.available) { $in.addClass('is-valid'); $hint.attr('class', 'form-text text-success').html('<i class="bi bi-check-circle"></i> Có thể sử dụng'); }
      else { $in.addClass('border-danger'); $hint.attr('class', 'form-text text-danger').html('<i class="bi bi-x-circle"></i> Đã tồn tại, vui lòng chọn mã khác'); }
    });
  }, 400));

  /* ---------------------------------------------------------------
     Xem trước ảnh: <input type="file" data-preview="#imgPreview">
     --------------------------------------------------------------- */
  $(document).on('change', 'input[type=file][data-preview]', function () {
    var file = this.files && this.files[0], $img = $($(this).data('preview'));
    var maxMb = Number($(this).data('max-mb') || 5);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { SA.toast('Chỉ chấp nhận ảnh JPG, PNG, WEBP', 'warning'); this.value = ''; return; }
    if (file.size > maxMb * 1024 * 1024) { SA.toast('Ảnh tối đa ' + maxMb + 'MB', 'warning'); this.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function (ev) { $img.attr('src', ev.target.result).removeClass('d-none'); $img.siblings('.js-upload-placeholder').addClass('d-none'); };
    reader.readAsDataURL(file);
  });
  $(document).on('dragover dragleave drop', '.sa-upload', function (e) {
    e.preventDefault();
    $(this).toggleClass('dragover', e.type === 'dragover');
    if (e.type === 'drop') {
      var input = $(this).find('input[type=file]')[0];
      input.files = e.originalEvent.dataTransfer.files;
      $(input).trigger('change');
    }
  });

  /* ---------------------------------------------------------------
     Bảng: chọn tất cả + thanh thao tác hàng loạt
     --------------------------------------------------------------- */
  $(document).on('change', '.js-check-all', function () {
    var $table = $(this).closest('table');
    $table.find('.js-check-row').prop('checked', this.checked).trigger('change');
  });
  $(document).on('change', '.js-check-row', function () {
    var $table = $(this).closest('table'), n = $table.find('.js-check-row:checked').length;
    $('.sa-bulkbar').toggleClass('show', n > 0).find('.js-bulk-count').text(n);
  });

  /* Highlight dòng vừa lưu: /products?highlight=15 */
  (function () {
    var m = /[?&]highlight=(\d+)/.exec(location.search);
    if (!m) return;
    var $row = $('tr[data-id="' + m[1] + '"]').addClass('sa-highlight');
    if ($row.length) $row[0].scrollIntoView({ block: 'center' });
  })();

  /* ---------------------------------------------------------------
     Đổi trạng thái đơn hàng (AJAX)
     <select class="js-order-status" data-order-id="88" data-current="NEW">
     Server: POST /api/orders/{id}/status  {"status":"DELIVERED"} -> {"status":"DELIVERED","label":"Đã giao"}
     --------------------------------------------------------------- */
  var STATUS_LABEL = { NEW: 'Mới', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' };
  var STATUS_FLOW = { NEW: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['SHIPPING', 'CANCELLED'], SHIPPING: ['DELIVERED', 'CANCELLED'], DELIVERED: [], CANCELLED: [] };

  $(document).on('change', 'select.js-order-status', function () {
    var $s = $(this), id = $s.data('order-id'), from = $s.data('current'), to = $s.val();
    if (!to || to === from) return;

    var doChange = function () {
      $s.prop('disabled', true);
      var req = SA.config.demo
        ? SA.fake({ id: id, status: to, label: STATUS_LABEL[to] },
                  STATUS_FLOW[from].indexOf(to) < 0 ? 'Không thể chuyển từ "' + STATUS_LABEL[from] + '" sang "' + STATUS_LABEL[to] + '"' : null)
        : SA.postJson('/api/orders/' + id + '/status', { status: to });

      req.done(function (res) {
        $s.data('current', res.status);
        $('#status-badge-' + id).attr('class', 'sa-status status-' + res.status.toLowerCase()).text(res.label);
        SA.toast('Đơn #' + id + ': ' + res.label);
      }).fail(function () { $s.val(from); })
        .always(function () { $s.prop('disabled', false); });
    };

    if (to === 'CANCELLED') {
      SA.confirm({ title: 'Hủy đơn hàng?', message: 'Tồn kho sẽ được hoàn lại. Thao tác không thể hoàn tác.', okText: 'Hủy đơn' })
        .then(doChange, function () { $s.val(from); });
    } else doChange();
  });

  /* ---------------------------------------------------------------
     Biểu đồ doanh thu (Dashboard) — cần Chart.js
     Server: GET /api/reports/revenue?days=7 -> {"labels":["15/10",...],"values":[1200000,...]}
     --------------------------------------------------------------- */
  var revenueChart;
  function renderRevenue(data) {
    var el = document.getElementById('revenueChart');
    if (!el || typeof Chart === 'undefined') return;
    var css = getComputedStyle(document.documentElement);
    var primary = css.getPropertyValue('--sa-primary').trim() || '#9a5b2f';
    var grid = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
    var text = css.getPropertyValue('--sa-muted').trim();
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(el, {
      type: 'bar',
      data: { labels: data.labels, datasets: [{ label: 'Doanh thu', data: data.values, backgroundColor: primary, borderRadius: 6, maxBarThickness: 38 }] },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return ' ' + SA.formatMoney(c.parsed.y); } } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: text } },
          y: { grid: { color: grid }, border: { display: false },
               ticks: { color: text, callback: function (v) { return v >= 1e6 ? (v / 1e6).toLocaleString('vi-VN') + 'tr' : SA.formatNumber(v); } } }
        }
      }
    });
  }
  function loadRevenue() {
    var $el = $('#revenueChart');
    if (!$el.length) return;
    var days = $('#revenueDays').val() || 7;
    var req = SA.config.demo
      ? SA.fake(demoRevenue(days))
      : $.getJSON(SA.url('/api/reports/revenue'), { days: days, branchId: $('#branchFilter').val() || '' });
    req.done(renderRevenue);
  }
  function demoRevenue(days) {
    var labels = [], values = [], d = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var x = new Date(d); x.setDate(d.getDate() - i);
      labels.push(('0' + x.getDate()).slice(-2) + '/' + ('0' + (x.getMonth() + 1)).slice(-2));
      values.push(i === 3 ? 0 : Math.round((6 + Math.sin(i * 1.7) * 3 + (days - i) * 0.4) * 1e6 / 1000) * 1000);
    }
    return { labels: labels, values: values };
  }
  $(document).on('change', '#revenueDays, #branchFilter', loadRevenue);
  $(document).on('sa:theme', loadRevenue);

  /* ---------------------------------------------------------------
     Tạo đơn hàng: thêm/xóa dòng, tính tiền, tra khách theo SĐT
     --------------------------------------------------------------- */
  function recalcOrder() {
    var $form = $('#orderForm'); if (!$form.length) return;
    var subtotal = 0, items = 0, warn = false;
    $form.find('.js-line').each(function () {
      var $r = $(this), $opt = $r.find('.js-product option:selected');
      var price = Number($opt.data('price') || 0), stock = Number($opt.data('stock') || 0);
      var qty = Math.max(0, parseInt($r.find('.js-qty').val(), 10) || 0);
      $r.find('.js-price').text(price ? SA.formatMoney(price) : '—');
      $r.find('.js-line-total').text(price ? SA.formatMoney(price * qty) : '—');
      var over = price && qty > stock;
      $r.find('.js-qty').toggleClass('is-invalid', !!over);
      $r.find('.js-stock').text(price ? 'Còn ' + stock : '').toggleClass('text-danger fw-semibold', !!over).toggleClass('text-muted-2', !over);
      warn = warn || over;
      subtotal += price * qty; if (price) items += qty;
    });
    var discount = SA.parseMoney($('#discountValue').data('value'));
    var ship = SA.parseMoney($('#shippingFee').val());
    $('#sumItems').text(items);
    $('#sumSubtotal').text(SA.formatMoney(subtotal));
    $('#sumDiscount').text(discount ? '−' + SA.formatMoney(discount) : '0 ₫');
    $('#sumTotal').text(SA.formatMoney(Math.max(0, subtotal - discount + ship)));
    $('#stockWarning').toggleClass('d-none', !warn);
    $('#orderSubmit').prop('disabled', warn || items === 0);
    $('#emptyLines').toggleClass('d-none', $form.find('.js-line').length > 0);
  }
  $(document).on('click', '#addLine', function () {
    var tpl = document.getElementById('lineTemplate');
    $('#orderLines').append(document.importNode(tpl.content, true));
    recalcOrder();
  });
  $(document).on('click', '.js-remove-line', function () { $(this).closest('.js-line').remove(); recalcOrder(); });
  $(document).on('change input', '#orderForm .js-product, #orderForm .js-qty, #shippingFee', recalcOrder);

  $(document).on('click', '#applyVoucher', function () {
    var code = $.trim($('#voucher').val()).toUpperCase();
    if (!code) return;
    // Thực tế: gọi API kiểm tra voucher. Demo: MOC10 giảm 10%
    var subtotal = SA.parseMoney($('#sumSubtotal').text());
    if (code === 'MOC10') {
      $('#discountValue').data('value', Math.round(subtotal * 0.1)).text('Đã áp dụng MOC10 (−10%)');
      SA.toast('Áp dụng mã giảm giá thành công');
    } else {
      $('#discountValue').data('value', 0).text('');
      SA.toast('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'warning');
    }
    recalcOrder();
  });

  $(document).on('click', '#findCustomer', function () {
    var phone = $.trim($('#customerPhone').val());
    if (!/^0[35789]\d{8}$/.test(phone)) { $('#customerPhone').addClass('is-invalid'); return; }
    $('#customerPhone').removeClass('is-invalid');
    var req = SA.config.demo
      ? SA.fake(phone === '0905123456' ? { found: true, id: 1, fullName: 'Võ Minh Khang', address: '12 Bạch Đằng, Hải Châu, Đà Nẵng', orders: 7 } : { found: false })
      : $.getJSON(SA.url('/api/customers/by-phone'), { phone: phone });
    req.done(function (c) {
      if (c.found) {
        $('#customerId').val(c.id);
        $('#customerFound').removeClass('d-none').find('.js-name').text(c.fullName).end()
          .find('.js-address').text(c.address).end().find('.js-orders').text(c.orders);
        $('#customerNew').addClass('d-none').find('input').prop('required', false);
      } else {
        $('#customerId').val('');
        $('#customerFound').addClass('d-none');
        $('#customerNew').removeClass('d-none').find('input[name=customerName]').prop('required', true).trigger('focus');
        SA.toast('Khách hàng mới — vui lòng nhập thông tin', 'info');
      }
    });
  });

  /* ---------------------------------------------------------------
     Modal sửa nhân viên: nút có data-user='{"id":..}' => đổ dữ liệu vào form
     --------------------------------------------------------------- */
  $(document).on('show.bs.modal', '#userModal', function (e) {
    var $m = $(this), data = $(e.relatedTarget).data('user');
    var $f = $m.find('form')[0];
    $f.reset(); $($f).removeClass('was-validated');
    if (data) {
      $m.find('.modal-title').text('Sửa nhân viên');
      $.each(data, function (k, v) { $m.find('[name="' + k + '"]').val(v); });
      $m.find('[name=username]').prop('readonly', true);
      $m.find('.js-password-group').addClass('d-none').find('input').prop('required', false);
    } else {
      $m.find('.modal-title').text('Thêm nhân viên');
      $m.find('[name=id]').val('');
      $m.find('[name=username]').prop('readonly', false);
      $m.find('.js-password-group').removeClass('d-none').find('input').prop('required', true);
    }
  });

  /* ---------------------------------------------------------------
     Hiện/ẩn mật khẩu + kiểm tra độ mạnh
     --------------------------------------------------------------- */
  $(document).on('click', '[data-toggle-password]', function () {
    var $in = $($(this).data('toggle-password')), show = $in.attr('type') === 'password';
    $in.attr('type', show ? 'text' : 'password');
    $(this).find('i').attr('class', show ? 'bi bi-eye-slash' : 'bi bi-eye');
  });
  $(document).on('input', '#newPassword, #confirmPassword', function () {
    var v = $('#newPassword').val() || '';
    var rules = { len: v.length >= 8, upper: /[A-Z]/.test(v), lower: /[a-z]/.test(v), digit: /\d/.test(v), special: /[^A-Za-z0-9]/.test(v) };
    $.each(rules, function (k, ok) {
      $('.sa-pw-rules [data-rule=' + k + ']').toggleClass('ok', ok).find('i').attr('class', ok ? 'bi bi-check-circle-fill' : 'bi bi-circle');
    });
    var score = $.map(rules, function (x) { return x ? 1 : null; }).length;
    $('#pwStrength').css('width', (score * 20) + '%').attr('class', 'progress-bar ' + (score < 3 ? 'bg-danger' : score < 5 ? 'bg-warning' : 'bg-success'));
    var c = $('#confirmPassword')[0];
    if (c) c.setCustomValidity(c.value && c.value !== v ? 'Mật khẩu xác nhận không khớp' : '');
  });

  /* ---------------------------------------------------------------
     Khởi động
     --------------------------------------------------------------- */
  $(function () {
    $('[data-bs-toggle="tooltip"]').each(function () { bootstrap.Tooltip.getOrCreateInstance(this); });
    $('[data-counter]').each(function () { updateCounter(this); });
    $('.js-print').on('click', function () { window.print(); });
    loadRevenue();
    recalcOrder();
    // Thông báo flash tự ẩn sau 6 giây
    setTimeout(function () { $('.alert.js-autohide').each(function () { bootstrap.Alert.getOrCreateInstance(this).close(); }); }, 6000);
    if (SA.config.demo) console.info('[ShopAdmin] Chế độ DEMO: AJAX và submit form được giả lập.');
  });
})(jQuery);
