/* Painted scenes for the story pages. Each scene is a function returning SVG markup in a
   1200 x 640 box. Shapes are grouped under a watercolour filter (#wc) or a brush filter (#brush),
   both defined in index.html. Characters: the boy (我), 爸爸 and 妈妈 always wear the same colours. */
(function () {
  var n = 0;
  function uid() { return "k" + (++n); }

  /* ---------- primitives ---------- */
  /* W: opaque paint. Each object is laid on its own patch of paper (as a watercolourist leaves the paper
     white where a house will go), so whatever is in front hides what is behind it.
     G: a see-through glaze, only for shadows, water over objects and rugs. */
  function W(s, f) { return '<g class="o" filter="url(#' + (f || "wc") + 'O)">' + s + "</g>"; }
  function G(s, f) { return '<g class="w" filter="url(#' + (f || "wc") + ')">' + s + "</g>"; }
  function Wn(s, f) { return '<g filter="url(#' + (f || "wc") + ')">' + s + "</g>"; }
  function B(s) { return '<g class="w" filter="url(#brush)">' + s + "</g>"; }
  function Bn(s) { return '<g filter="url(#brush)">' + s + "</g>"; }
  function P(d, fill, op) { return '<path fill="' + fill + '" fill-opacity="' + (op == null ? 0.85 : op) + '" d="' + d + '"/>'; }
  function E(cx, cy, rx, ry, fill, op, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" fill-opacity="' + (op == null ? 0.9 : op) + '"' +
      (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + "/>";
  }
  function C(cx, cy, r, fill, op) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" fill-opacity="' + (op == null ? 0.9 : op) + '"/>'; }
  function R(x, y, w, h, fill, op, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 8 : rx) + '" fill="' + fill + '" fill-opacity="' + (op == null ? 0.9 : op) + '"/>'; }
  function L(d, stroke, w, op, dash) {
    return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + (w || 4) + '" stroke-opacity="' + (op == null ? 0.85 : op) + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
  }
  function T(x, y, s, inner, rot) { return '<g transform="translate(' + x + " " + y + ") scale(" + s + ")" + (rot ? " rotate(" + rot + ")" : "") + '">' + inner + "</g>"; }
  var seed = 1;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  var INK = "#2A2622", SKIN = "#F1C9A5", CHEEK = "#E9A38D";

  /* ---------- backgrounds ---------- */
  function sky(c, h) { h = h || 440; return W(P("M8 14 C 320 0, 820 26, 1192 10 L 1190 " + h + " C 860 " + (h - 26) + ", 380 " + (h - 4) + ", 12 " + (h - 18) + " Z", c || "#C3DCE6", 0.75)); }
  function sun(x, y, r) { return W(C(x || 1010, y || 105, r || 58, "#F3C98C", 0.75)); }
  function hills(y, c) {
    y = y || 300;
    return W(P("M-20 " + (y + 40) + " C 120 " + (y - 70) + ", 230 " + (y - 110) + ", 360 " + (y - 40) + " C 460 " + (y + 12) + ", 560 " + (y - 100) + ", 700 " + (y - 140) +
      " C 820 " + (y - 170) + ", 930 " + (y - 60) + ", 1050 " + (y - 85) + " C 1130 " + (y - 100) + ", 1180 " + (y - 60) + ", 1230 " + (y - 38) + " L 1230 660 L -20 660 Z", c || "#A7C0B4", 0.85));
  }
  function ground(y, c, op) { return W(P("M-20 " + y + " C 300 " + (y - 30) + ", 800 " + (y + 22) + ", 1230 " + (y - 12) + " L 1230 660 L -20 660 Z", c || "#B9CD8B", op == null ? 0.9 : op)); }
  function tufts(pts, c) {
    return B(pts.map(function (p) { var x = p[0], y = p[1]; return L("M" + x + " " + y + " l-8 -22 M" + (x + 6) + " " + y + " l2 -28 M" + (x + 12) + " " + y + " l10 -20", c || "#7E9F4E", 4, 0.8); }).join(""));
  }
  function cloud(x, y, s, c, op) {
    return Wn(T(x, y, s, E(0, 0, 90, 38, c, op) + E(-60, 10, 60, 30, c, op) + E(60, 12, 64, 30, c, op) + E(10, -26, 54, 36, c, op)));
  }
  function rain(n, x0, x1, y0, y1, c) {
    seed = 7; var s = "";
    for (var i = 0; i < n; i++) { var x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0); s += L("M" + x.toFixed(0) + " " + y.toFixed(0) + " l-10 30", c || "#6F98AF", 4, 0.75); }
    return B(s);
  }
  function wind(x, y, s) {
    return B(T(x, y, s, L("M0 0 C 120 -30, 200 30, 300 0 C 350 -18, 352 -62, 318 -66 C 290 -68, 284 -40, 302 -32", "#7FA6BC", 7, 0.75) +
      L("M30 40 C 130 22, 200 60, 270 44", "#7FA6BC", 5, 0.6)));
  }
  function birds(list) { return B(list.map(function (b) { return L("M" + b[0] + " " + b[1] + " q 12 -12 24 0 q 12 -12 24 0", "#5A5F63", 4, 0.75); }).join("")); }
  function paper() { return '<rect width="1200" height="640" fill="#F8F4EA"/><rect width="1200" height="640" filter="url(#blotch)"/>'; }
  function grain() { return '<rect width="1200" height="640" filter="url(#grain)" style="mix-blend-mode:multiply"/>'; }

  function room(noWindow) {
    var s = W(P("M-10 -10 H1210 V478 H-10 Z", "#EADBC3", 0.75));
    if (!noWindow) s += W(R(760, 80, 270, 200, "#C6DDE7", 0.85, 6)) + B(L("M760 80 h270 v200 h-270 Z M895 80 v200 M760 180 h270", "#9E8160", 7, 0.8));
    s += W(R(170, 110, 150, 105, "#E6C38A", 0.6, 4)) + B(L("M190 190 l35 -40 l30 28 l25 -20 l20 32", "#8EAE9E", 5, 0.7) + L("M170 110 h150 v105 h-150 Z", "#9E8160", 5, 0.7));
    s += W(P("M-20 470 C 400 460, 800 480, 1230 466 L1230 660 L-20 660Z", "#D6B88E", 0.85));
    s += B(L("M-20 520 C 400 512, 800 528, 1230 516 M-20 585 C 400 576, 800 594, 1230 580", "#B8976C", 3, 0.45));
    s += G(E(600, 590, 470, 52, "#C98466", 0.2));
    return s;
  }

  /* ---------- objects ---------- */
  function face(cx, cy, r, mood, look) {
    var lx = (look || 0) * r * 0.12, er = Math.max(2.6, r * 0.075), s = "";
    if (mood === "joy") {
      s += L("M" + (cx - r * 0.45 + lx) + " " + (cy) + " q " + r * 0.12 + " " + (-r * 0.14) + " " + r * 0.24 + " 0 M" + (cx + r * 0.21 + lx) + " " + cy + " q " + r * 0.12 + " " + (-r * 0.14) + " " + r * 0.24 + " 0", INK, Math.max(2.5, r * 0.06), 1);
    } else {
      s += C(cx - r * 0.33 + lx, cy, er, INK, 1) + C(cx + r * 0.33 + lx, cy, er, INK, 1);
    }
    s += E(cx - r * 0.56, cy + r * 0.28, r * 0.15, r * 0.1, CHEEK, 0.55) + E(cx + r * 0.56, cy + r * 0.28, r * 0.15, r * 0.1, CHEEK, 0.55);
    var my = cy + r * 0.36;
    if (mood === "o") s += E(cx + lx * 0.5, my + r * 0.04, r * 0.1, r * 0.13, "#8E3B33", 0.95);
    else if (mood === "open") s += P("M" + (cx - r * 0.3) + " " + (my - r * 0.06) + " Q " + cx + " " + (my + r * 0.5) + " " + (cx + r * 0.3) + " " + (my - r * 0.06) + " Z", "#8E3B33", 0.95);
    else if (mood === "grin" || mood === "joy") s += P("M" + (cx - r * 0.26) + " " + (my - r * 0.04) + " Q " + cx + " " + (my + r * 0.34) + " " + (cx + r * 0.26) + " " + (my - r * 0.04) + " Z", "#8E3B33", 0.9);
    else s += L("M" + (cx - r * 0.18) + " " + my + " Q " + cx + " " + (my + r * 0.16) + " " + (cx + r * 0.18) + " " + my, INK, Math.max(2.4, r * 0.055), 1);
    return s;
  }

  function melon(cx, cy, rx, ry, o) {
    o = o || {}; var id = uid(), s = "";
    if (!o.noShadow) s += G(E(cx, cy + ry * 0.92, rx * 1.02, ry * 0.2, "#8C7B5C", 0.25));
    s += W(E(cx, cy, rx, ry, o.color || "#74A256", 0.93));
    var stripes = "", ks = rx > 70 ? [-0.62, -0.22, 0.22, 0.62] : [-0.5, 0, 0.5];
    ks.forEach(function (k) { var x = cx + k * rx, bx = x + k * rx * 0.3; stripes += L("M" + x + " " + (cy - ry) + " C " + bx + " " + (cy - ry * 0.4) + ", " + bx + " " + (cy + ry * 0.4) + ", " + x + " " + (cy + ry), "#2E5A32", Math.max(4, rx * 0.085), 0.75); });
    s += '<clipPath id="' + id + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></clipPath>';
    s += B('<g clip-path="url(#' + id + ')">' + stripes + "</g>");
    s += Wn(E(cx - rx * 0.4, cy - ry * 0.45, rx * 0.26, ry * 0.15, "#EAF2D2", 0.6, -25));
    if (o.face) s += face(cx, cy + ry * 0.02, Math.min(rx, ry) * 0.95, o.mood || "smile", o.look);
    return o.rot ? '<g transform="rotate(' + o.rot + " " + cx + " " + cy + ')">' + s + "</g>" : s;
  }

  function vines(list) {
    var s = "", leaves = "";
    list.forEach(function (v) { s += L(v.d, "#6C8E45", 4, 0.85); (v.leaves || []).forEach(function (l) { leaves += E(l[0], l[1], l[2], l[2] * 0.55, "#86A957", 0.85, l[3]); }); });
    return B(s) + W(leaves);
  }

  function sheep(cx, cy, s, smile) {
    var body = C(-40, -6, 32, "#E9E3D5") + C(0, -20, 36, "#E9E3D5") + C(40, -6, 32, "#E9E3D5") + C(-18, 14, 30, "#E9E3D5") + C(24, 14, 30, "#E9E3D5");
    var out = L("M-70 -6 a32 32 0 0 1 36 -30 a36 36 0 0 1 68 0 a32 32 0 0 1 36 32 a30 30 0 0 1 -46 40 a30 30 0 0 1 -50 -2 a32 32 0 0 1 -44 -40", "#B4A994", 4, 0.75);
    var legs = L("M-26 34 v26 M26 34 v26", "#4E4743", 9, 0.95);
    var head = E(66, -22, 22, 28, "#4E4743", 0.95, -18) + E(48, -44, 13, 6, "#4E4743", 0.95, -30);
    var eyes = C(60, -26, 3.5, "#F8F4EA", 1) + C(74, -28, 3.5, "#F8F4EA", 1) + (smile ? L("M60 -12 q 7 6 14 0", "#F8F4EA", 2.5, 1) : "");
    return T(cx, cy, s, B(legs) + W(body) + B(out) + W(head) + eyes);
  }
  function cow(cx, cy, s) {
    var body = E(0, 0, 85, 52, "#EDE7DA") + E(-30, -12, 26, 20, "#3B3634", 0.85) + E(34, 16, 20, 15, "#3B3634", 0.85);
    var legs = L("M-50 40 v40 M-20 44 v38 M30 44 v38 M58 40 v40", "#5A524C", 11, 0.95) + L("M-84 -10 q -24 20 -10 50", "#5A524C", 5, 0.9);
    var head = E(96, -26, 32, 36, "#EDE7DA") + E(106, 0, 25, 16, "#E9B2A0", 0.95) + E(74, -50, 14, 7, "#EDE7DA", 0.95, -25) + E(120, -52, 14, 7, "#EDE7DA", 0.95, 25);
    var horns = L("M82 -58 q -8 -18 -2 -26 M112 -60 q 8 -16 2 -26", "#B79B78", 6, 0.9);
    var outline = L("M-85 0 a85 52 0 1 0 170 0 a85 52 0 1 0 -170 0", "#B4A994", 3, 0.6);
    var eyes = C(86, -30, 4, INK, 1) + C(108, -30, 4, INK, 1) + C(100, 2, 3, "#9E5C55", 1) + C(112, 2, 3, "#9E5C55", 1);
    return T(cx, cy, s, B(legs) + W(body) + B(outline + horns) + W(head) + eyes);
  }
  function truck(x, y, s, c) {
    c = c || "#5E86A8";
    var w = W(R(-180, -100, 200, 64, c, 0.9, 6) + R(20, -160, 112, 124, c, 0.92, 16) + R(40, -146, 72, 52, "#D9E8EE", 0.9, 8));
    var wheels = W(C(-120, -26, 32, "#3A3633", 0.95) + C(84, -26, 32, "#3A3633", 0.95)) + Wn(C(-120, -26, 11, "#D8D1C4", 0.9) + C(84, -26, 11, "#D8D1C4", 0.9));
    return T(x, y, s, w + B(L("M-180 -100 h200 M-60 -100 v64", "#3F5F7C", 4, 0.6)) + wheels);
  }
  function car(x, y, s, c) {
    c = c || "#C8553D";
    var body = P("M-200 -40 Q-204 -92 -150 -96 L-96 -100 Q-62 -168 18 -168 L84 -168 Q140 -168 172 -100 L206 -94 Q228 -88 226 -40 Z", c, 0.92);
    var win = P("M-74 -104 Q-48 -154 12 -154 L16 -104 Z", "#D9E8EE", 0.9) + P("M36 -104 L36 -154 L82 -154 Q124 -154 150 -104 Z", "#D9E8EE", 0.9);
    var wheels = W(C(-118, -36, 40, "#3A3633", 0.95) + C(140, -36, 40, "#3A3633", 0.95)) + Wn(C(-118, -36, 14, "#D8D1C4", 0.9) + C(140, -36, 14, "#D8D1C4", 0.9));
    return T(x, y, s, W(body + win) + B(L("M-200 -60 h420", "#8E3B2B", 3, 0.45)) + wheels);
  }
  function engine(x, y, s) {
    var box = R(0, -86, 210, 86, "#6F9AC0", 0.95, 6) + R(150, -150, 34, 66, "#3F5F7C", 0.95, 4);
    var plate = C(232, -46, 46, "#EDE3CF", 0.95);
    var wheels = C(50, -4, 24, "#4A4642", 0.95) + C(160, -4, 24, "#4A4642", 0.95) + C(50, -4, 8, "#D8D1C4", 1) + C(160, -4, 8, "#D8D1C4", 1);
    var lines = L("M232 -92 a46 46 0 1 1 -0.1 0", "#45698A", 4, 0.75);
    return T(x, y, s, W(box + plate) + W(wheels) + B(lines));
  }
  function carriage(x, y, s, c) {
    var box = R(0, -80, 180, 80, c || "#E2A84B", 0.95, 6), wheels = C(40, -4, 22, "#4A4642", 0.95) + C(140, -4, 22, "#4A4642", 0.95) + C(40, -4, 7, "#D8D1C4", 1) + C(140, -4, 7, "#D8D1C4", 1);
    var lines = L("M0 -80 l-16 -20 M180 -80 l16 -20", "#8C6D4C", 4, 0.6);
    return T(x, y, s, W(box) + W(wheels) + B(lines));
  }
  function puffs(x, y, s) { return Wn(T(x, y, s, C(0, 0, 26, "#FFFFFF", 0.85) + C(34, -26, 34, "#FFFFFF", 0.85) + C(80, -50, 42, "#FFFFFF", 0.8))) + B(T(x, y, s, L("M-26 0 a26 26 0 0 1 52 0 M0 -26 a34 34 0 0 1 68 0 M38 -50 a42 42 0 0 1 84 0", "#B9B2A6", 3, 0.6))); }
  function rope(x1, x2, y) { return B(L("M" + x1 + " " + y + " q " + (x2 - x1) / 2 + " 14 " + (x2 - x1) + " 0", "#8C6D4C", 4, 0.8)); }

  function mound(cx, base, w, h, o) {
    o = o || {};
    var d = "M" + (cx - w) + " " + base + " C " + (cx - w * 0.6) + " " + (base - h * 0.15) + ", " + (cx - w * 0.38) + " " + (base - h) + ", " + cx + " " + (base - h) + " C " + (cx + w * 0.38) + " " + (base - h) + ", " + (cx + w * 0.6) + " " + (base - h * 0.15) + ", " + (cx + w) + " " + base + " Z";
    if (o.ghost) return B(L(d, "#9C7350", 4, 0.45, "14 12"));
    var s = W(P(d, o.wet ? "#86603F" : "#9C7350", 0.9));
    s += B(L("M" + (cx - w * 0.5) + " " + (base - h * 0.35) + " q 30 -10 60 0 M" + (cx + w * 0.15) + " " + (base - h * 0.55) + " q 26 -8 52 0", "#7A5638", 4, 0.5));
    if (o.crater) s += W(E(cx, base - h + 10, Math.max(26, w * 0.17), 13, "#5E4330", 0.92));
    if (o.flames) {
      var t = base - h + 6, f = o.flames;
      s += W(T(cx, t, f, P("M-34 4 Q-46 -50 -18 -84 Q-8 -44 2 -100 Q22 -46 34 -74 Q44 -32 34 4 Z", "#E2643C", 0.9) + P("M-16 4 Q-22 -30 -6 -50 Q2 -22 12 -46 Q22 -18 16 4 Z", "#F2B33D", 0.92)));
    }
    if (o.streams) s += B(L("M" + (cx - 20) + " " + (base - h + 14) + " q -30 " + h * 0.4 + " -70 " + (h - 20) + " M" + (cx + 22) + " " + (base - h + 14) + " q 34 " + h * 0.45 + " 80 " + (h - 22), "#6F98AF", 6, 0.7));
    return s;
  }
  function bucket(x, y, s) {
    return T(x, y, s, W(P("M-42 -84 L42 -84 L32 0 L-32 0 Z", "#6F9AC0", 0.92) + E(0, -84, 42, 10, "#8EBDCA", 0.95)) + B(L("M-40 -80 q 40 -70 80 0", "#45698A", 4, 0.8)));
  }
  function spade(x1, y1, x2, y2) {
    var a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return B(L("M" + x1 + " " + y1 + " L" + x2 + " " + y2, "#9E7A50", 7, 0.95)) + W(T(x2, y2, 1, P("M0 -14 L34 -16 Q46 0 34 16 L0 14 Z", "#C8553D", 0.92), a));
  }
  function puddle(cx, cy, rx, ry) { return W(E(cx, cy, rx, ry, "#8EBDCA", 0.8)) + Wn(L("M" + (cx - rx * 0.5) + " " + (cy - ry * 0.2) + " h " + rx * 0.4 + " M" + (cx + rx * 0.1) + " " + (cy + ry * 0.25) + " h " + rx * 0.35, "#F4F8F6", 4, 0.9)); }
  function slice(x, y, s, rot) {
    var seeds = E(-24, 14, 4, 6, INK, 0.9, -30) + E(0, 22, 4, 6, INK, 0.9) + E(24, 14, 4, 6, INK, 0.9, 30);
    return T(x, y, s, W(P("M-68 0 A68 68 0 0 0 68 0 L60 0 A60 60 0 0 1 -60 0 Z", "#6F9D54", 0.95) + P("M-60 0 A60 60 0 0 0 60 0 Z", "#E1615B", 0.92)) + seeds, rot || 0);
  }
  function door(x, y, w, h, open) {
    var s = W(R(x - 14, y - 14, w + 28, h + 14, "#E2CFAE", 0.9, 4));
    if (open) s += W(R(x, y, w, h, "#6B5546", 0.92, 4));
    else s += W(R(x, y, w, h, "#B5653F", 0.92, 4)) + C(x + w - 22, y + h * 0.55, 9, "#E3B65B", 1) + B(L("M" + (x + 22) + " " + (y + 24) + " h " + (w - 44) + " v " + (h * 0.35) + " h " + (-(w - 44)) + " Z", "#8E4A2E", 4, 0.6));
    return s;
  }
  function tree(x, y, s) {
    return T(x, y, s, B(L("M0 0 L0 -170 M0 -110 l-40 -40 M0 -130 l36 -36", "#7A5638", 16, 0.9)) + W(C(-50, -200, 70, "#8FB36A", 0.8) + C(40, -220, 80, "#86A957", 0.8) + C(0, -270, 70, "#9CC27A", 0.8)));
  }

  /* ---------- people ---------- */
  var KINDS = {
    boy: { legTop: -72, bodyTop: -140, bodyW: 72, headCy: -176, r: 36, shirt: "#E07B5A", pants: "#5D7FA6", hair: "boy", arm: 62, shoulder: -128, shorts: true },
    dad: { legTop: -150, bodyTop: -272, bodyW: 104, headCy: -310, r: 40, shirt: "#6E9C9A", pants: "#4F5B6B", hair: "dad", arm: 110, shoulder: -258 },
    mom: { legTop: -70, bodyTop: -246, bodyW: 88, headCy: -282, r: 37, shirt: "#E9B95B", hair: "mom", arm: 98, shoulder: -234, dress: true }
  };
  function hair(kind, cx, cy, r, back) {
    if (kind === "mom") {
      if (back) return W(P("M" + (cx - r * 1.12) + " " + (cy + r * 0.95) + " C " + (cx - r * 1.45) + " " + (cy - r * 1.25) + ", " + (cx + r * 1.45) + " " + (cy - r * 1.25) + ", " + (cx + r * 1.12) + " " + (cy + r * 0.95) + " Z", "#3A2E2A", 0.92));
      return W(P("M" + (cx - r * 1.02) + " " + (cy + r * 0.1) + " C " + (cx - r * 1.05) + " " + (cy - r * 1.25) + ", " + (cx + r * 1.05) + " " + (cy - r * 1.25) + ", " + (cx + r * 1.02) + " " + (cy + r * 0.1) + " Q " + (cx + r * 0.7) + " " + (cy - r * 0.62) + " " + (cx - r * 0.1) + " " + (cy - r * 0.6) + " Q " + (cx - r * 0.7) + " " + (cy - r * 0.45) + " " + (cx - r * 1.02) + " " + (cy + r * 0.1) + " Z", "#3A2E2A", 0.92) + C(cx + r * 0.62, cy - r * 0.98, r * 0.36, "#3A2E2A", 0.92));
    }
    if (back) return "";
    if (kind === "boy") return W(P("M" + (cx - r * 1.06) + " " + (cy + r * 0.12) + " C " + (cx - r * 1.16) + " " + (cy - r * 1.36) + ", " + (cx + r * 1.16) + " " + (cy - r * 1.36) + ", " + (cx + r * 1.06) + " " + (cy + r * 0.12) + " L " + (cx + r * 0.95) + " " + (cy - r * 0.26) + " Q " + (cx + r * 0.3) + " " + (cy - r * 0.5) + " " + cx + " " + (cy - r * 0.3) + " Q " + (cx - r * 0.35) + " " + (cy - r * 0.55) + " " + (cx - r * 0.95) + " " + (cy - r * 0.2) + " Z", "#2E2A28", 0.92));
    return W(P("M" + (cx - r * 1.0) + " " + (cy - r * 0.05) + " C " + (cx - r * 1.02) + " " + (cy - r * 1.28) + ", " + (cx + r * 1.02) + " " + (cy - r * 1.28) + ", " + (cx + r * 1.0) + " " + (cy - r * 0.05) + " Q " + (cx + r * 0.55) + " " + (cy - r * 0.72) + " " + cx + " " + (cy - r * 0.6) + " Q " + (cx - r * 0.55) + " " + (cy - r * 0.72) + " " + (cx - r * 1.0) + " " + (cy - r * 0.05) + " Z", "#2E2A28", 0.92));
  }
  function head(kind, cx, cy, r, mood, look) {
    var s = hair(kind, cx, cy, r, true);
    s += W(C(cx - r * 0.98, cy + r * 0.1, r * 0.19, SKIN, 0.95) + C(cx + r * 0.98, cy + r * 0.1, r * 0.19, SKIN, 0.95) + C(cx, cy, r, SKIN, 0.95), "wcS");
    s += hair(kind, cx, cy, r, false);
    s += face(cx, cy + r * 0.08, r, mood, look);
    if (kind === "dad") {
      var gx = (look || 0) * r * 0.12, gy = cy + r * 0.08, gr = r * 0.19, gw = Math.max(1.8, r * 0.04);
      s += '<g fill="none" stroke="#3A3633" stroke-opacity="0.85" stroke-width="' + gw + '"><circle cx="' + (cx - r * 0.33 + gx) + '" cy="' + gy + '" r="' + gr + '"/><circle cx="' + (cx + r * 0.33 + gx) + '" cy="' + gy + '" r="' + gr + '"/>' +
        '<path d="M' + (cx - r * 0.14 + gx) + " " + gy + " h " + r * 0.28 + '" stroke-linecap="round"/></g>';
    }
    return s;
  }
  function armPath(sx, sy, side, a, len) {
    var segs = Array.isArray(a) ? a : [a], x = sx, y = sy, d = "M" + sx + " " + sy, l = len / segs.length;
    segs.forEach(function (ang) { var rad = ang * Math.PI / 180; x += side * Math.sin(rad) * l; y += Math.cos(rad) * l; d += " L" + x.toFixed(1) + " " + y.toFixed(1); });
    return { d: d, x: x, y: y };
  }
  /* person(kind, o) draws at the origin with feet at y = 0. Returns {body, head} so a head can be layered separately. */
  function person(kind, o) {
    o = o || {}; var k = KINDS[kind], w = k.bodyW / 2, legs = o.legs || "stand", s = "";
    if (kind === "mom" && legs !== "none") s += "";
    if (legs === "stand") {
      var lw = k.bodyW * 0.26, lx = k.bodyW * 0.23;
      s += Bn(L("M" + (-lx) + " " + k.legTop + " L" + (-lx - 2) + " -6 M" + lx + " " + k.legTop + " L" + (lx + 2) + " -6", k.pants && !k.shorts ? k.pants : SKIN, lw, 0.95));
      if (k.shorts) s += W(P("M" + (-w + 2) + " " + (k.legTop - 6) + " L" + (w - 2) + " " + (k.legTop - 6) + " L" + (w + 2) + " " + (k.legTop + 26) + " L" + 4 + " " + (k.legTop + 26) + " L0 " + (k.legTop + 10) + " L-4 " + (k.legTop + 26) + " L" + (-w - 2) + " " + (k.legTop + 26) + " Z", k.pants, 0.92));
      s += W(E(-lx - 6, -4, k.bodyW * 0.17, 8, "#3A3633", 0.95) + E(lx + 6, -4, k.bodyW * 0.17, 8, "#3A3633", 0.95));
    } else if (legs === "straddle") {
      s += Bn(L("M" + (-w * 0.5) + " " + k.legTop + " L" + (-w * 1.7) + " " + (k.legTop + 50) + " M" + (w * 0.5) + " " + k.legTop + " L" + (w * 1.7) + " " + (k.legTop + 50), SKIN, k.bodyW * 0.24, 0.95));
      s += W(P("M" + (-w) + " " + (k.legTop - 8) + " L" + w + " " + (k.legTop - 8) + " L" + (w * 1.35) + " " + (k.legTop + 22) + " L" + (-w * 1.35) + " " + (k.legTop + 22) + " Z", k.pants, 0.92));
      s += W(E(-w * 1.8, k.legTop + 54, k.bodyW * 0.16, 9, "#3A3633", 0.95) + E(w * 1.8, k.legTop + 54, k.bodyW * 0.16, 9, "#3A3633", 0.95));
    }
    var t = k.bodyTop, b = k.legTop + 10, body;
    if (k.dress) body = "M" + (-w) + " " + (t + 16) + " Q" + (-w) + " " + t + " " + (-w + 16) + " " + t + " L" + (w - 16) + " " + t + " Q" + w + " " + t + " " + w + " " + (t + 16) + " L" + (w * 1.45) + " " + k.legTop + " L" + (-w * 1.45) + " " + k.legTop + " Z";
    else body = "M" + (-w) + " " + (t + 16) + " Q" + (-w) + " " + t + " " + (-w + 16) + " " + t + " L" + (w - 16) + " " + t + " Q" + w + " " + t + " " + w + " " + (t + 16) + " L" + (w + 4) + " " + b + " L" + (-w - 4) + " " + b + " Z";
    s += W(P(body, k.shirt, 0.92), "wcS");
    var arms = o.arms || [12, 12], arm = "", hands = "";
    [-1, 1].forEach(function (side, i) {
      var a = armPath(side * (w - 8), k.shoulder, side, arms[i], k.arm);
      arm += L(a.d, k.shirt, k.bodyW * 0.24, 0.95);
      hands += C(a.x, a.y, k.bodyW * 0.12, SKIN, 0.95);
      if (o.hands) o.hands.push([a.x, a.y]);
    });
    s += Bn(arm) + W(hands, "wcS");
    return { body: s, head: head(kind, 0, k.headCy, k.r, o.mood || "smile", o.look) };
  }
  function fig(kind, x, y, sc, o) { var p = person(kind, o); return T(x, y, sc, p.body + p.head); }
  /* Seated in a box: the hip sits 20px above the box bottom, so only the upper body shows. */
  function seated(kind, x, bottom, sc, o) { o = o || {}; o.legs = "none"; var k = KINDS[kind]; return fig(kind, x, bottom - 20 * sc - k.legTop * sc, sc, o); }
  function bust(kind, cx, cy, r, mood, look) {
    var k = KINDS[kind];
    var sh = W(P("M" + (cx - r * 1.7) + " 700 C " + (cx - r * 1.7) + " " + (cy + r * 1.3) + ", " + (cx - r * 1.1) + " " + (cy + r * 1.05) + ", " + cx + " " + (cy + r * 1.05) + " C " + (cx + r * 1.1) + " " + (cy + r * 1.05) + ", " + (cx + r * 1.7) + " " + (cy + r * 1.3) + ", " + (cx + r * 1.7) + " 700 Z", k.shirt, 0.92), "wcS");
    return sh + head(kind, cx, cy, r, mood, look);
  }

  /* ---------- composed settings ---------- */
  function field(withFace) {
    return sky() + sun() + hills(300) + ground(372, "#B9CD8B") + B(L("M40 452 C 300 425, 700 440, 1160 418", "#C49B6E", 30, 0.55) + L("M20 540 C 320 515, 760 530, 1180 505", "#C49B6E", 34, 0.55) + L("M0 622 C 330 600, 780 615, 1200 592", "#C49B6E", 38, 0.55)) +
      vines([{ d: "M200 520 C 160 560, 120 540, 90 580", leaves: [[96, 572, 34, -20], [160, 546, 28, 25]] }, { d: "M450 430 C 520 400, 560 440, 600 470", leaves: [[520, 420, 30, -15], [585, 455, 24, 30]] }, { d: "M740 520 C 790 560, 840 530, 880 520", leaves: [[800, 556, 28, 10]] }, { d: "M970 540 C 1030 570, 1080 540, 1120 560", leaves: [[1060, 556, 30, -25], [1125, 566, 22, 20]] }]) +
      melon(330, 470, 122, 92) + melon(660, 498, 86, 66) + melon(925, 522, 54, 44, { face: withFace });
  }
  function river() {
    return sky("#C6DDE6", 420) + W(P("M-20 300 C 100 220, 200 170, 330 210 C 430 240, 520 160, 640 140 C 760 120, 860 220, 990 200 C 1080 186, 1160 220, 1230 240 L 1230 360 L -20 360 Z", "#A2BCB0", 0.8)) +
      W(P("M-20 292 C 300 270, 800 300, 1230 282 L 1230 352 L -20 352 Z", "#C8D597", 0.85)) + W(P("M-20 326 C 320 306, 880 340, 1230 316 L 1230 660 L -20 660 Z", "#8EBDCA", 0.85) + P("M-20 470 C 300 440, 760 480, 1230 450 L 1230 660 L -20 660 Z", "#6EA3B6", 0.5));
  }
  function reeds() {
    return W(P("M-20 520 C 80 500, 190 520, 270 560 C 320 590, 340 630, 350 660 L -20 660 Z", "#D8C18D", 0.9) + P("M1230 560 C 1140 548, 1060 570, 1010 610 C 990 630, 985 650, 985 660 L 1230 660 Z", "#D8C18D", 0.9)) +
      B(L("M60 640 C 62 560, 70 500, 84 440 M100 640 C 100 570, 110 520, 128 470 M140 640 C 146 590, 160 550, 182 510 M40 640 C 34 590, 28 540, 18 500 M1080 640 C 1078 590, 1084 540, 1096 500 M1120 640 C 1124 600, 1134 560, 1150 530", "#6F8F45", 5, 0.85)) +
      W(E(86, 432, 9, 26, "#8A5A3B", 0.85, 10) + E(131, 462, 8, 22, "#8A5A3B", 0.85, 18) + E(1097, 492, 8, 22, "#8A5A3B", 0.85, 8));
  }
  function ripples(cx, cy, w) { return B(L("M" + (cx - w) + " " + cy + " C " + (cx - w * 0.5) + " " + (cy + 16) + ", " + (cx + w * 0.5) + " " + (cy + 16) + ", " + (cx + w) + " " + (cy - 2), "#F5F9F7", 5, 0.9) + L("M" + (cx - w * 1.4) + " " + (cy + 30) + " C " + (cx - w * 0.6) + " " + (cy + 52) + ", " + (cx + w * 0.6) + " " + (cy + 52) + ", " + (cx + w * 1.4) + " " + (cy + 24), "#F5F9F7", 4, 0.9)); }
  function house(doorOpen) {
    return W(P("M560 150 L1230 150 L1230 570 L560 570 Z", "#EBD6B4", 0.85)) + W(P("M520 168 L880 50 L1250 168 Z", "#B8584A", 0.85)) +
      W(R(610, 250, 150, 120, "#C6DDE7", 0.85, 4)) + B(L("M610 250 h150 v120 h-150 Z M685 250 v120", "#9E8160", 6, 0.8)) + door(840, 300, 170, 262, doorOpen) + W(R(800, 560, 250, 26, "#C9B79A", 0.9, 4));
  }
  function sandpit(skyCol, wet) {
    return sky(skyCol) + (skyCol ? "" : sun()) + hills(300, "#AFC6B9") + ground(360, "#B9CD8B") +
      Wn(P("M60 430 C 400 415, 800 420, 1140 430 L1210 650 L-10 650 Z", wet ? "#DCCB9F" : "#EEDDB2", 0.97)) + B(L("M60 430 C 400 415, 800 420, 1140 430 M60 430 L-10 650 M1140 430 L1210 650", "#B48A5C", 10, 0.75)) + tufts([[30, 400], [1160, 405]]);
  }
  function trainRow(sc, x0, opts) {
    opts = opts || {}; var gap = 205 * sc, y = 600, s = "", units = opts.units || ["cow", "sheep", "mom", "dad", "boy"];
    units.forEach(function (u, i) {
      var x = x0 + i * gap;
      if (u === "boy") {
        s += seated("boy", x + 70 * sc, y, sc * 1.15, { arms: opts.boyArms || [[60, 100], [60, 100]], mood: opts.mood || "grin" }) + engine(x, y, sc);
        if (opts.smoke) s += puffs(x + 170 * sc, y - 170 * sc, sc * opts.smoke);
      } else {
        if (u === "sheep") s += sheep(x + 92 * sc, y - 92 * sc, sc * 1.05, true);
        else if (u === "cow") s += cow(x + 70 * sc, y - 96 * sc, sc * 0.8);
        else s += seated(u, x + 90 * sc, y, sc * 0.95, { arms: opts.adultArms || [20, 20], mood: opts.mood || "smile" });
        s += carriage(x, y, sc, ["#E2A84B", "#A9C47F", "#D9826A", "#B9A3D0"][i % 4]);
        if (i < units.length - 1) s += rope(x + 180 * sc, x + gap, y - 30 * sc);
      }
    });
    return s;
  }

  /* ---------- the pages ---------- */
  var S = {};
  /* 小瓜下山 */
  S["melon-1"] = function () {
    return sky() + sun() + hills(280) + ground(440, "#C9D79B") + W(P("M-20 660 C 150 600, 360 330, 600 300 C 840 330, 1050 600, 1230 660 Z", "#B9CD8B", 0.9)) +
      B(L("M500 330 C 560 320, 640 320, 700 330", "#C49B6E", 14, 0.6) + L("M470 356 C 560 344, 650 346, 735 356", "#C49B6E", 14, 0.6)) +
      melon(560, 318, 28, 21, { noShadow: true }) + melon(615, 324, 20, 16, { noShadow: true }) + melon(652, 330, 13, 11, { noShadow: true }) +
      B(L("M600 370 C 520 420, 760 470, 640 530 C 560 580, 760 610, 840 650", "#D9C08F", 22, 0.7)) +
      W(R(1000, 528, 120, 80, "#EBD6B4", 0.9, 4)) + W(P("M984 532 L1060 474 L1136 532Z", "#B8584A", 0.9)) + W(R(1046, 562, 26, 46, "#B5653F", 0.95, 2)) + tufts([[140, 600], [300, 560], [880, 590], [1150, 620]]);
  };
  S["melon-2"] = function () { return field(true); };
  S["melon-3"] = function () {
    return sky() + sun(1060, 100, 50) + hills(260) + ground(400, "#C9D79B") + W(P("M-20 330 C 200 330, 500 380, 800 470 C 950 515, 1100 560, 1230 580 L1230 660 L-20 660Z", "#B9CD8B", 0.9)) +
      B(L("M10 362 C 120 352, 220 356, 320 368", "#C49B6E", 18, 0.55)) + melon(110, 344, 64, 48) + melon(250, 356, 44, 34) +
      wind(60, 170, 1) + wind(180, 250, 0.75) + B(L("M560 372 q -30 10 -60 0 M548 412 q -34 10 -66 0 M560 452 q -30 10 -60 0", "#7FA6BC", 6, 0.75)) +
      melon(650, 418, 54, 44, { face: true, mood: "o", rot: -30 }) + tufts([[420, 420], [900, 520], [1100, 560]]);
  };
  S["melon-4"] = function () {
    return sky() + sun() + hills(250, "#AFC6B9") + ground(300, "#C9D79B") + W(P("M150 350 L1050 350 L1190 650 L10 650 Z", "#9CC27A", 0.8)) +
      B(L("M150 350 L1050 350 L1190 650 L10 650 Z", "#D9C08F", 18, 0.8) + L("M600 350 L600 650 M80 500 L1120 500", "#D9C08F", 24, 0.85)) +
      B((function () { var s = ""; for (var r = 0; r < 4; r++) for (var c = 0; c < 9; c++) { var y = 380 + r * 34, x = 200 + c * 92 + r * -18; if (Math.abs(x - 600) > 30) s += L("M" + x + " " + y + " l-6 -14 M" + (x + 6) + " " + y + " l6 -14", "#5E8F3E", 3.5, 0.75); } return s; })()) +
      melon(830, 572, 62, 50, { face: true, mood: "smile", look: -1 });
  };
  S["melon-5"] = function () {
    return river() + melon(640, 430, 72, 58, { face: true, mood: "o", noShadow: true }) + G(P("M540 462 C 590 450, 690 452, 742 464 C 720 492, 560 494, 540 462 Z", "#7FB0C0", 0.7)) + ripples(640, 478, 120) +
      B(L("M90 380 C 180 372, 260 386, 330 378 M860 390 C 940 380, 1020 394, 1110 384", "#F5F9F7", 4, 0.9)) + reeds();
  };
  S["melon-6"] = function () {
    return sky() + sun(1040, 110, 54) + hills(300) + ground(420, "#C9D79B") + W(P("M-20 660 L-20 210 C 100 130, 260 150, 380 270 C 470 360, 560 420, 700 470 L 1230 560 L1230 660Z", "#B9CD8B", 0.9)) +
      B(L("M110 240 C 300 270, 110 350, 360 390 C 620 430, 420 490, 760 530 C 950 552, 1060 566, 1240 580", "#D9C08F", 38, 0.75)) +
      melon(720, 470, 44, 35, { face: true, mood: "grin" }) + truck(780, 560, 0.9) + puffs(560, 520, 0.6) + tufts([[200, 470], [480, 560], [1000, 610]]);
  };
  S["melon-7"] = function () {
    return sky() + sun(170, 100, 50) + hills(360, "#AFC6B9") + ground(470, "#C9D79B") + ground(560, "#B9CD8B") + house(true) + fig("boy", 925, 562, 1.05, { arms: [12, 150], mood: "o" }) +
      truck(300, 600, 0.85) + B(L("M700 610 C 760 600, 800 592, 830 586", "#D9C08F", 26, 0.7)) + tufts([[90, 600], [520, 610]]);
  };
  S["melon-8"] = function () {
    return W(P("M-10 -10 H1210 V660 H-10 Z", "#EBD6B4", 0.85)) + W(R(330, 40, 540, 580, "#E2CFAE", 0.9, 4)) + W(R(360, 70, 480, 560, "#9C8575", 0.75, 4)) +
      fig("mom", 470, 640, 0.95, { arms: [20, 20], mood: "grin", look: 1 }) + fig("dad", 720, 650, 0.95, { arms: [20, 20], mood: "grin", look: 1 }) +
      fig("boy", 590, 640, 1.4, { arms: [40, 70], mood: "joy" }) + W(R(260, 610, 680, 40, "#C9B79A", 0.95, 4)) +
      melon(905, 562, 64, 52, { face: true, mood: "grin", look: -1 }) + W(P("M960 660 C 1000 600, 1100 600, 1230 590 L1230 660Z", "#B9CD8B", 0.9));
  };

  /* 爸爸大，我小 */
  S["big-1"] = function () {
    return sky() + sun() + hills(320) + ground(470) + tree(160, 560, 1.1) + fig("dad", 520, 600, 1.15, { arms: [12, 40], mood: "smile", look: 1 }) + fig("boy", 720, 600, 1.0, { arms: [140, 12], mood: "grin", look: -1 }) + tufts([[380, 610], [900, 600], [1080, 590]]);
  };
  S["big-2"] = function () { return sky("#D3E4EA", 640) + bust("dad", 430, 330, 150, "smile", 1) + bust("boy", 860, 430, 92, "grin", -1); };
  S["big-3"] = function () {
    return sky("#D3E4EA", 640) + bust("dad", 430, 300, 150, "open", 0) + slice(430, 500, 1.6) + W(C(310, 520, 30, SKIN, 0.95) + C(550, 520, 30, SKIN, 0.95), "wcS") +
      bust("boy", 860, 420, 92, "o", 0) + slice(860, 548, 0.8) + W(C(806, 560, 18, SKIN, 0.95) + C(914, 560, 18, SKIN, 0.95), "wcS");
  };
  S["big-4"] = function () {
    var hands = [];
    var boy = fig("boy", 900, 600, 1.0, { arms: [20, 95], mood: "grin", hands: hands });
    return sky() + sun() + hills(330) + ground(470) + car(330, 600, 1.0) + fig("dad", 640, 600, 1.05, { arms: [70, 12], mood: "smile" }) + boy + car(1000, 470, 0.32, "#E9A23B");
  };
  function shoulders(boyMood, boyArms) {
    var dad = person("dad", { arms: [[30, 160], [30, 160]], mood: "joy" }), k = KINDS.dad;
    var boyY = (k.headCy - k.r) - 2 - KINDS.boy.legTop;
    return dad.body + T(0, boyY, 1, person("boy", { legs: "straddle", arms: boyArms || [160, 160], mood: boyMood || "grin" }).body + person("boy", { legs: "straddle", mood: boyMood || "grin" }).head) + dad.head;
  }
  S["big-5"] = function () { return sky("#C3DCE6", 420) + sun(1030, 110, 56) + hills(390) + ground(520) + T(600, 625, 1.0, shoulders("grin", [160, 160])) + tufts([[200, 600], [980, 610]]) + birds([[200, 120], [270, 150]]); };
  S["big-6"] = function () { return sky("#C3DCE6", 640) + cloud(250, 150, 1.1, "#FFFFFF", 0.85) + cloud(980, 230, 0.9, "#FFFFFF", 0.85) + birds([[130, 300], [190, 270], [1000, 120]]) + T(600, 1040, 1.65, shoulders("joy", [120, 120])); };

  /* 我的火山 */
  S["volcano-1"] = function () { return sandpit() + mound(560, 568, 110, 60) + bucket(800, 590, 1.0) + spade(700, 610, 760, 560) + fig("boy", 380, 600, 1.05, { arms: [12, 40], mood: "grin" }); };
  S["volcano-2"] = function () { return sandpit() + mound(600, 590, 250, 200) + bucket(1000, 610, 0.9) + fig("boy", 930, 600, 1.0, { arms: [160, 160], mood: "grin" }); };
  S["volcano-3"] = function () { return sandpit() + mound(600, 590, 250, 200, { crater: true }) + fig("boy", 330, 600, 1.05, { arms: [100, 125], mood: "smile", look: 1 }) + spade(400, 432, 560, 400); };
  S["volcano-4"] = function () {
    return sandpit() + fig("dad", 900, 590, 0.95, { arms: [150, 150], mood: "joy" }) + fig("mom", 1060, 590, 0.95, { arms: [150, 150], mood: "joy" }) +
      mound(560, 590, 250, 200, { crater: true, flames: 1.2 }) + fig("boy", 250, 610, 1.05, { arms: [110, 110], mood: "grin" });
  };
  S["volcano-5"] = function () {
    return sandpit("#B9C4CC", true) + cloud(260, 90, 1.3, "#9AA6AF", 0.8) + cloud(700, 70, 1.5, "#A5B0B8", 0.8) + cloud(1060, 110, 1.1, "#9AA6AF", 0.8) +
      mound(560, 590, 250, 200, { crater: true, flames: 0.9, wet: true }) + rain(70, 0, 1200, 140, 600) + fig("boy", 950, 610, 1.0, { arms: [30, 30], mood: "o", look: -1 });
  };
  S["volcano-6"] = function () {
    return sandpit("#AEB9C2", true) + cloud(300, 80, 1.4, "#8E9AA3", 0.8) + cloud(860, 70, 1.6, "#97A2AB", 0.8) +
      mound(600, 590, 250, 200, { ghost: true }) + mound(600, 590, 190, 105, { crater: true, wet: true, streams: true, flames: 0.6 }) + puddle(370, 600, 90, 18) + puddle(840, 604, 110, 20) + rain(110, 0, 1200, 120, 620);
  };
  S["volcano-7"] = function () {
    return sandpit("#C3D1D9", true) + cloud(900, 80, 1.2, "#B1BCC4", 0.7) + rain(25, 500, 1200, 120, 400) + puddle(520, 560, 330, 72) + W(E(500, 556, 120, 22, "#86603F", 0.85)) +
      W(T(640, 548, 0.7, P("M-34 4 Q-46 -50 -18 -84 Q-8 -44 2 -100 Q22 -46 34 -74 Q44 -32 34 4 Z", "#E2643C", 0.85), 70)) + fig("boy", 980, 610, 1.05, { arms: [100, 100], mood: "o", look: -1 });
  };
  S["volcano-8"] = function () {
    return sandpit() + fig("dad", 120, 590, 0.82, { arms: [150, 150], mood: "joy" }) + fig("mom", 250, 590, 0.82, { arms: [150, 150], mood: "joy" }) +
      mound(600, 600, 300, 250, { crater: true, flames: 1.4 }) + bucket(1060, 612, 0.9) + fig("boy", 930, 610, 1.05, { arms: [160, 20], mood: "joy" });
  };

  /* 开火车 */
  S["train-1"] = function () { return room() + seated("boy", 560, 600, 1.35, { arms: [[60, 100], [60, 100]], mood: "grin" }) + engine(470, 600, 1.35) + puffs(700, 360, 1.0); };
  S["train-2"] = function () { return room() + trainRow(1.05, 120, { units: ["mom", "dad", "boy"], adultArms: [12, 150], smoke: 0.8 }); };
  S["train-3"] = function () { return room() + trainRow(1.3, 60, { units: ["cow", "sheep", "mom"], adultArms: [20, 20] }); };
  S["train-4"] = function () { return room() + trainRow(1.0, 40, { smoke: 0.7 }); };
  S["train-5"] = function () {
    return room() + B(L("M40 430 h70 M20 470 h90 M50 510 h60", "#9E8160", 6, 0.6)) + trainRow(1.0, 60, { smoke: 1.0, boyArms: [[60, 100], 165], adultArms: [150, 150], mood: "joy" });
  };
  S["train-6"] = function () {
    var cushions = W(P("M40 560 C 120 380, 300 350, 400 560 Z", "#AFC6D4", 0.85) + P("M330 560 C 430 300, 640 290, 740 560 Z", "#9DB8CA", 0.85) + P("M680 560 C 770 370, 960 370, 1060 560 Z", "#AFC6D4", 0.85));
    var sofa = W(R(-20, 340, 1240, 240, "#CBD8E0", 0.6, 30)) + cushions + W(R(-20, 550, 1240, 80, "#8FA9BC", 0.85, 16));
    var train = T(640, -70, 0.62, trainRow(1, -560, { smoke: 0.9, adultArms: [150, 150], mood: "joy", boyArms: [[60, 100], 165] }), -10);
    return room(true) + sofa + B(L("M80 420 C 200 330, 300 300, 380 330 M100 460 C 220 370, 300 340, 360 360", "#9E8160", 5, 0.5)) + train;
  };
  S["train-7"] = function () {
    return room(true) + door(960, 170, 180, 310, false) + trainRow(0.85, 40, { units: ["cow", "sheep", "mom", "dad"], adultArms: [150, 20], mood: "joy" }) + engine(720, 600, 0.85) + fig("boy", 880, 610, 1.0, { arms: [150, 12], mood: "joy" });
  };

  window.SCENES = S;
  window.renderScene = function (id) { var f = S[id]; return paper() + (f ? f() : "") + grain(); };
})();
