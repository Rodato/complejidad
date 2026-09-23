# Prepara las dos redes del taller como JSON para la app (src/data/).
#
#   Rscript scripts/preparar_datos.R
#
# - medici.json : red de matrimonios de las familias florentinas (Padgett y Ansell,
#                 1993), el subconjunto de 16 familias que usa Jackson (2008, cap. 1).
#                 Sale del paquete ergm de statnet (datos/florentine.RData). Se deja
#                 fuera a los Pucci, que no tienen matrimonios con las demás: así lo
#                 hace Jackson y por eso sus cifras (Medici .522) cuadran con las nuestras.
# - got.json    : red de personajes del libro 1 de «Canción de hielo y fuego»
#                 (Beveridge y Shan, 2016). Licencia CC BY-NC-SA 4.0. Dos personajes
#                 quedan unidos si sus nombres aparecen a menos de 15 palabras.
#
# Las posiciones de los nodos se calculan aquí, una vez, con semilla fija: todos los
# estudiantes ven la misma red y pueden decir «la familia de arriba a la izquierda».
# Las métricas NO se guardan: las calcula la app (src/lib/red.ts), y este script
# imprime las de igraph para verificarlas contra esas.

suppressMessages({
  library(igraph)
  library(jsonlite)
})

normalizar <- function(l, margen = 0.06) {
  l <- as.matrix(l)
  for (j in 1:2) {
    r <- range(l[, j])
    l[, j] <- margen + (1 - 2 * margen) * (l[, j] - r[1]) / (r[2] - r[1])
  }
  round(l, 4)
}

# ── Medici ───────────────────────────────────────────────────────────────────
e <- new.env()
load("datos/florentine.RData", envir = e)
m <- e$flomarriage
atr <- data.frame(
  id = sapply(m$val, function(x) x$vertex.names),
  riqueza = sapply(m$val, function(x) x$wealth),
  priorias = sapply(m$val, function(x) x$priorates),
  stringsAsFactors = FALSE
)
el <- t(sapply(m$mel, function(x) c(atr$id[x$outl], atr$id[x$inl])))
g <- graph_from_edgelist(el, directed = FALSE)

set.seed(7)
lay <- normalizar(layout_with_kk(g))
nodos <- data.frame(id = V(g)$name, x = lay[, 1], y = lay[, 2], stringsAsFactors = FALSE)
nodos <- merge(nodos, atr, by = "id")
write_json(
  list(nodos = nodos, aristas = unname(split(el, seq_len(nrow(el))))),
  "src/data/medici.json", auto_unbox = TRUE, pretty = TRUE
)

cat("── Medici (verificación)\n")
print(data.frame(
  grado = degree(g),
  intermediacion = round(betweenness(g, normalized = TRUE), 3),
  vector_propio = round(eigen_centrality(g)$vector, 3),
  cercania = round(closeness(g, normalized = TRUE), 3),
  agrupamiento = round(transitivity(g, type = "local"), 3)
))

# ── Game of Thrones, libro 1 ─────────────────────────────────────────────────
x <- read.csv("datos/asoiaf-book1-edges.csv", stringsAsFactors = FALSE)
G <- graph_from_data_frame(x[, c("Source", "Target")], directed = FALSE)
set.seed(11)
# Estrés (graphlayouts) reparte mejor que Fruchterman–Reingold: el núcleo no queda
# hecho una bola y en el celular se alcanza a tocar cada punto.
L <- normalizar(graphlayouts::layout_with_stress(G), margen = 0.03)
etiqueta <- function(s) {
  s <- gsub("-\\(.*\\)$", "", s)          # «Jon-Umber-(Greatjon)» → «Jon-Umber»
  gsub("-", " ", s)
}
write_json(
  list(
    nodos = data.frame(id = V(G)$name, etiqueta = etiqueta(V(G)$name),
                       x = L[, 1], y = L[, 2], stringsAsFactors = FALSE),
    aristas = unname(split(as.matrix(x[, c("Source", "Target")]), seq_len(nrow(x))))
  ),
  "src/data/got.json", auto_unbox = TRUE
)

top <- function(v, k = 10) paste(names(sort(v, decreasing = TRUE))[1:k], collapse = ", ")
cat("\n── GoT libro 1:", vcount(G), "personajes,", ecount(G), "vínculos\n")
cat("grado:          ", top(degree(G)), "\n")
cat("intermediación: ", top(betweenness(G)), "\n")
cat("vector propio:  ", top(eigen_centrality(G)$vector), "\n")
cat("cercanía:       ", top(closeness(G)), "\n")
