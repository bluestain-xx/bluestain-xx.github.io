window.onCheckXiumiBgImage = ({ editor, message, $page, iframeDom }) => {
  $("body").append('<div id="xiumiuRender"></div>');
  const close = () => {
    message.destroy();
    $page.editorLoding = false;
    $('#xiumiuRender').remove();
  }

  $("#xiumiuRender").html(editor.getValue("content")).css({ position: "fixed", left: '9999px', top: '9999px' });
  let urls = [];
  $("#xiumiuRender *").each(function () {
    const $el = $(this);
    const bgImg = $el.css("background-image");
    if (bgImg.includes("xiumi.us")) {
      const url = bgImg.match(/url\(["']?([^"')]+)["']?\)/)[1];
      if (url) {
        console.log("背景图url:", url);
        $(this).attr('data-bg', url);
        urls.push(url)
      }
    }
  });
  if (!urls.length) {
    close();
    message.success('图片转存成功');
    return
  }
  $.ajax({
    url: window.location.origin + '/humanresources/main/ueditor?action=catchimage',
    type: "POST",
    data: { "source[]": urls },
    success: function (res) {
      console.log("成功", res);
      if (res.state == "SUCCESS") {
        const els = $('#xiumiuRender').find('[data-bg]');
        els.each(function () {
          const obj = (res.list || []).find(item => item.source == $(this).attr('data-bg'));
          if (obj) {
            $(this).css('background-image', `url('${obj.url}')`).removeAttr('data-bg')
          }
        })
        const htmlStr = $('#xiumiuRender').html();
        editor.setValue("content", htmlStr);
        iframeDom?.setContent(htmlStr);
        close();
        message.success('图片转存成功:success--');
      } else {
        close();
        message.error('图片转存失败');
      }
    },
    error: function (xhr) {
      close();
      message.error('图片转存失败');
      console.error("失败", xhr.responseText);
    }
  });
}