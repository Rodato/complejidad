# Prepara las dos redes del taller como JSON para la app (src/data/).
#
#   python3 scripts/notaria_aristas.py   # primero: la red curada de la Notaría
#   Rscript scripts/preparar_datos.R
#
# - got.json      : las 8 temporadas de la serie Juego de tronos (Beveridge, 2016–2019,
#                   github.com/mathbeveridge/gameofthrones, CC BY-NC-SA 4.0). Dos
#                   personajes quedan unidos si interactúan en una escena (hablan uno
#                   después del otro, uno habla del otro, aparecen juntos…). El peso es
#                   cuántas veces pasa. Red NO dirigida.
# - notaria.json  : compraventas de la Notaría 2 de Cali, 1938–1944, dirigidas
#                   vendedor -> comprador (datos/notaria_aristas.csv).
#
# Las posiciones se calculan aquí, una vez, con semilla fija, sobre la red de TODAS las
# temporadas (o todos los años) juntas. Así un personaje está siempre en el mismo sitio
# y lo que cambia de una temporada a otra son los vínculos: eso es lo que se mira.
# Las métricas NO se guardan: las calcula la app (src/lib/red.ts). Este script imprime
# las de igraph para verificarlas.

suppressMessages({
  library(igraph)
  library(jsonlite)
  library(graphlayouts)
})

# recorte: los pocos personajes de una sola escena quedan lejísimos y aplastan el
# núcleo; se les acerca al borde (cuantil) en vez de dejar que definan la escala.
normalizar <- function(l, margen = 0.02, recorte = 0) {
  l <- as.matrix(l)
  for (j in 1:2) {
    r <- quantile(l[, j], c(recorte, 1 - recorte))
    l[, j] <- pmin(pmax(l[, j], r[1]), r[2])
    l[, j] <- margen + (1 - 2 * margen) * (l[, j] - r[1]) / (r[2] - r[1])
  }
  round(l, 4)
}

# ── Juego de tronos, temporadas 1 a 8 ────────────────────────────────────────
temporadas <- lapply(1:8, function(s) {
  e <- read.csv(sprintf("datos/got/got-s%d-edges.csv", s), stringsAsFactors = FALSE)
  e[, c("Source", "Target", "Weight")]
})
etiquetas <- unique(do.call(rbind, lapply(1:8, function(s) {
  read.csv(sprintf("datos/got/got-s%d-nodes.csv", s), stringsAsFactors = FALSE)
})))
etiquetas <- etiquetas[!duplicated(etiquetas$Id), ]

# Los apodos que la traducción al español volvió nombres propios.
apodos <- c(
  LITTLEFINGER = "Meñique", HOUND = "El Perro", MOUNTAIN = "La Montaña",
  HIGH_SPARROW = "Gorrión Supremo", NIGHT_KING = "Rey de la Noche",
  BLACKFISH = "Pez Negro", GREY_WORM = "Gusano Gris", RED_WOMAN = "Melisandre",
  THREE_EYED_RAVEN = "Cuervo de Tres Ojos", WAIF = "La Niña Abandonada"
)

union_got <- do.call(rbind, temporadas)
g_union <- simplify(graph_from_data_frame(union_got[, 1:2], directed = FALSE))
set.seed(11)
lay <- normalizar(layout_with_stress(g_union), recorte = 0.015)
ids <- V(g_union)$name
etq <- etiquetas$Label[match(ids, etiquetas$Id)]
etq[is.na(etq)] <- ids[is.na(etq)]
etq[ids %in% names(apodos)] <- apodos[ids[ids %in% names(apodos)]]

write_json(
  list(
    personajes = data.frame(id = ids, etiqueta = etq, x = lay[, 1], y = lay[, 2]),
    temporadas = lapply(temporadas, function(e) unname(as.list(as.data.frame(t(e))))),
    fuente = "Beveridge, A. (2016–2019). Network of Thrones. github.com/mathbeveridge/gameofthrones (CC BY-NC-SA 4.0)."
  ),
  "src/data/got.json", auto_unbox = TRUE
)

cat("── Juego de tronos (verificación)\n")
for (s in 1:8) {
  g <- simplify(graph_from_data_frame(temporadas[[s]][, 1:2], directed = FALSE))
  gr <- sort(degree(g), decreasing = TRUE)[1:5]
  bt <- sort(betweenness(g, normalized = TRUE), decreasing = TRUE)[1:3]
  cat(sprintf("T%d  N=%d L=%d  grado: %s  |  intermediación: %s\n", s, vcount(g), ecount(g),
              paste(names(gr), gr, collapse = ", "),
              paste(names(bt), round(bt, 3), collapse = ", ")))
}

# ── Notaría 2 de Cali, 1938–1944 ─────────────────────────────────────────────
a <- read.csv("datos/notaria_aristas.csv", stringsAsFactors = FALSE, encoding = "UTF-8")

# Etiqueta legible: sin las notas que la transcripción dejó tras «;», con mayúscula
# inicial salvo en las partículas.
legible <- function(x) {
  x <- trimws(sub("\\s*;.*$", "", x))
  p <- strsplit(x, " ")[[1]]
  minus <- c("de", "del", "la", "las", "los", "y", "e", "vda.", "s.a", "s.a.", "ltda", "ltda.")
  p <- ifelse(p %in% minus, p,
              paste0(toupper(substr(p, 1, 1)), substr(p, 2, nchar(p))))
  p[p %in% c("s.a", "s.a.", "Sa")] <- "S. A."
  paste(p, collapse = " ")
}

g_not <- simplify(graph_from_data_frame(a[, c("source", "target")], directed = TRUE),
                  remove.multiple = TRUE, remove.loops = TRUE)
set.seed(11)
lay_n <- normalizar(layout_with_stress(as_undirected(g_not)))
nombres <- V(g_not)$name
cod <- setNames(sprintf("c%d", seq_along(nombres)), nombres)

write_json(
  list(
    actores = data.frame(
      id = unname(cod), etiqueta = unname(vapply(nombres, legible, "")),
      x = lay_n[, 1], y = lay_n[, 2]
    ),
    # [vendedor, comprador, año, escritura]
    aristas = unname(lapply(seq_len(nrow(a)), function(i) {
      list(cod[[a$source[i]]], cod[[a$target[i]]], a$anio[i], a$registro[i])
    })),
    # Qué dice cada escritura (el «negocio» transcrito), por número de registro.
    negocios = as.list(setNames(
      substr(a$negocio[!duplicated(a$registro)], 1, 220),
      a$registro[!duplicated(a$registro)]
    ))
  ),
  "src/data/notaria.json", auto_unbox = TRUE
)

cat("\n── Notaría 2 (verificación)\n")
g_m <- graph_from_data_frame(a[, c("source", "target")], directed = TRUE)
ent <- sort(degree(g_m, mode = "in"), decreasing = TRUE)[1:5]
sal <- sort(degree(g_m, mode = "out"), decreasing = TRUE)[1:5]
comp <- components(g_m, mode = "weak")
cat(sprintf("N=%d flechas=%d escrituras=%d componentes=%d gigante=%d (%.1f%%)\n",
            vcount(g_m), ecount(g_m), length(unique(a$registro)), comp$no,
            max(comp$csize), 100 * max(comp$csize) / vcount(g_m)))
cat("entrada:", paste(names(ent), ent, collapse = " · "), "\n")
cat("salida: ", paste(names(sal), sal, collapse = " · "), "\n")
for (y in sort(unique(a$anio))) {
  s <- a[a$anio == y, ]
  cat(sprintf("%d  escrituras=%d flechas=%d\n", y, length(unique(s$registro)), nrow(s)))
}
