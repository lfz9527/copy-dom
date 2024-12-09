// 唯一属性值的key
export const DATA_CLASS_ID = "JY-SITE-unique-ident-data" as const;

export const CLASS_PREFIX = "JY-SITE-COM";

export const RESET_CSS = `
            a,
      body,
      center,
      cite,
      code,
      dd,
      del,
      div,
      dl,
      dt,
      em,
      fieldset,
      figcaption,
      figure,
      footer,
      form,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      header,
      hr,
      html,
      img,
      input,
      label,
      legend,
      li,
      mark,
      ol,
      p,
      section,
      span,
      textarea,
      time,
      td,
      th,
      ul {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-style: normal;

        word-wrap: break-word;

        word-break: break-all;
        border: 0;
      }

      article,
      aside,
      details,
      fieldset,
      figcaption,
      figure,
      footer,
      header,
      main,
      nav,
      section {
        display: block;
      }

      button,
      input,
      textarea {
        margin: 0;
        padding: 0;
        font-size: 1em;
        font-family: "Microsoft YaHei", sans-serif, "Helvetica Neue", Helvetica, Arial, "黑体", "宋体", Arial;
        line-height: 1em;
        background-color: transparent;
        border: 0;
        outline: none;
        appearance: none;
      }

      textarea {
        appearance: none;
        resize: none;
      }

      input,
      textarea,
      a {
        -webkit-tap-highlight-color: transparent;
      }

          a,
          a:visited {
              text-decoration: none !important;
          }
      a:focus,
      a:active,
      a:hover {
        outline: none;
      }

      ol,
      li,
      ul {
        list-style: none;
      }

      img {
        font-size: 0;
        border-style: none;
      }
    `;
