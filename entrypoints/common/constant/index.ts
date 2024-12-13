// 唯一属性值的key
export const DATA_CLASS_ID = "JY-SITE-unique-ident-data" as const;

export const CLASS_PREFIX = "JY-SITE-COM";

export const RESET_CSS = `
html,
body,
body div,
span,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
abbr,
address,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
samp,
small,
strong,
sub,
sup,
var,
b,
i,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
figure,
footer,
header,
menu,
nav,
section,
time,
mark,
audio,
video,
details,
summary {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font-weight: normal;
	vertical-align: baseline;
	background: transparent;
}

main,
article,
aside,
figure,
footer,
header,
nav,
section,
details,
summary {
	display: block;
}

html {
	box-sizing: border-box;
}

*,
*:before,
*:after {
	box-sizing: inherit;
}

img {
	max-width: 100%;
}

ul {
	list-style: none;
}

blockquote,
q {
	quotes: none;
}

blockquote:before,
blockquote:after,
q:before,
q:after {
	content: '';
	content: none;
}

a {
	margin: 0;
	padding: 0;
	font-size: 100%;
	vertical-align: baseline;
	background: transparent;
}

del {
	text-decoration: line-through;
}

abbr[title],
dfn[title] {
	border-bottom: 1px dotted #000;
	cursor: help;
}

table {
	border-collapse: separate;
	border-spacing: 0;
	text-align: left;
}

th {
	font-weight: bold;
	vertical-align: bottom;
}

td {
	font-weight: normal;
	vertical-align: top;
}

td img {
	vertical-align: top;
}

hr {
	display: block;
	height: 1px;
	border: 0;
	border-top: 1px solid #999;
	margin: 1rem 0;
	padding: 0;
}

input,
select {
	vertical-align: middle;
}

pre {
	white-space: pre-line;
}

input[type="radio"] {
	vertical-align: text-bottom;
}

input[type="checkbox"] {
	vertical-align: bottom;
}

small {
	font-size: .8rem;
}

strong {
	font-weight: bold;
}

sub,
sup {
	font-size: .8rem;
	line-height: 0;
	position: relative;
}

sup {
	top: -0.5rem;
}

sub {
	bottom: -0.25rem;
}

pre,
code,
kbd,
samp {
	font-family: monospace, sans-serif;
}

label,
input[type=button],
input[type=submit],
input[type=file],
button {
	cursor: pointer;
}

button,
input,
select,
textarea {
	margin: 0;
}

ins {
	background-color: var(--highlight-color);
	color: #000;
	text-decoration: none;
}

mark {
	background-color: var(--highlight-color);
	color: #000;
	font-style: italic;
	font-weight: bold;
}

blockquote {
	padding: 2rem;
	border-left: 1px solid #333;
}

.clearfix:after {
	content: "";
	display: table;
	clear: both;
}
h1,
h2,
h3,
h4,
h5,
h6 {
	text-wrap: balance
}

p {
	text-wrap: pretty;
}

@media (prefers-reduced-motion: no-preference) {
	:has(:target) {
		scroll-behavior: smooth;
	}
}


:root {
	--font-system: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
`;

export const NodeTypes = {
  ELEMENT_NODE: 1, // 元素节点
  ATTRIBUTE_NODE: 2, // 属性节点
  TEXT_NODE: 3, // 文本节点
  CDATA_SECTION_NODE: 4, // CDATA 节点
  PROCESSING_INSTRUCTION_NODE: 7, // 处理指令节点
  COMMENT_NODE: 8, // 注释节点
  DOCUMENT_NODE: 9, // document 节点
  DOCUMENT_TYPE_NODE: 10, // documentType 节点
  DOCUMENT_FRAGMENT_NODE: 11, // documentFragment 节点
} as const;
