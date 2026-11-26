
const $ = id => document.getElementById(id);

const esc = texto => {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
};

const hoy = new Date().toISOString().slice(0, 10);

const limpiar = ids => {
    ids.forEach(id => {
        const elemento = $(id);
        if (elemento) elemento.textContent = "";
    });
};


/* SESIÓN Y ACCESO */

// Usuarios y contraseñas de demostración
const USUARIOS = [
    { usuario: "bibliotecario", clave: "libro2026" },
    { usuario: "gato", clave: "librocat" },
    { usuario: "admin", clave: "admin123" },
    { usuario: "lector", clave: "lector123" }
];

// Proteger las páginas internas
if (
    document.body.hasAttribute("data-protegida") &&
    !sessionStorage.getItem("sesion")
) {
    location.href = "../index.html";
}

// Cerrar sesión
if ($("salir")) {
    $("salir").onclick = () => {
        sessionStorage.clear();
        location.href = "../index.html";
    };
}

// Iniciar sesión
if ($("formLogin")) {
    $("formLogin").addEventListener("submit", evento => {
        evento.preventDefault();

        const usuario = $("usuario").value.trim();
        const clave = $("clave").value.trim();

        limpiar(["errUsuario", "errClave", "errGeneral"]);

        let valido = true;

        if (!usuario) {
            $("errUsuario").textContent =
                "Escribe tu usuario o correo.";
            valido = false;
        } else if (
            usuario.includes("@") &&
            !/^\S+@\S+\.\S+$/.test(usuario)
        ) {
            $("errUsuario").textContent =
                "El correo no es válido.";
            valido = false;
        }

        if (!clave) {
            $("errClave").textContent =
                "Escribe tu contraseña.";
            valido = false;
        }

        if (!valido) return;

        const encontrado = USUARIOS.find(
            u => u.usuario === usuario && u.clave === clave
        );

        if (!encontrado) {
            $("errGeneral").textContent =
                "Usuario o contraseña incorrectos.";
            return;
        }

        sessionStorage.setItem("sesion", usuario);
        location.href = "pages/inicio.html";
    });
}


/* DATOS DE LOS LIBROS */

// Los datos se conservan durante la sesión del navegador
let libros = JSON.parse(sessionStorage.getItem("libros")) || [
    {
        titulo: "Cien años de soledad",
        autor: "Gabriel García Márquez",
        genero: "Novela",
        anio: 1967,
        disponible: true
    },
    {
        titulo: "Don Quijote de la Mancha",
        autor: "Miguel de Cervantes",
        genero: "Clásico",
        anio: 1605,
        disponible: true
    },
    {
        titulo: "El principito",
        autor: "Antoine de Saint-Exupéry",
        genero: "Infantil",
        anio: 1943,
        disponible: true
    },
    {
        titulo: "Orgullo y prejuicio",
        autor: "Jane Austen",
        genero: "Romance",
        anio: 1813,
        disponible: true
    },
    {
        titulo: "Crimen y castigo",
        autor: "Fiódor Dostoyevski",
        genero: "Clásico",
        anio: 1866,
        disponible: true
    },
    {
        titulo: "El retrato de Dorian Gray",
        autor: "Oscar Wilde",
        genero: "Novela",
        anio: 1890,
        disponible: true
    },
    {
        titulo: "Alicia en el país de las maravillas",
        autor: "Lewis Carroll",
        genero: "Fantasía",
        anio: 1865,
        disponible: true
    },
    {
        titulo: "Los miserables",
        autor: "Victor Hugo",
        genero: "Clásico",
        anio: 1862,
        disponible: true
    },
    {
        titulo: "Frankenstein",
        autor: "Mary Shelley",
        genero: "Terror",
        anio: 1818,
        disponible: true
    },
    {
        titulo: "La metamorfosis",
        autor: "Franz Kafka",
        genero: "Ficción",
        anio: 1915,
        disponible: true
    },
    {
        titulo: "El conde de Montecristo",
        autor: "Alexandre Dumas",
        genero: "Aventura",
        anio: 1844,
        disponible: true
    },
    {
        titulo: "Mujercitas",
        autor: "Louisa May Alcott",
        genero: "Novela",
        anio: 1868,
        disponible: true
    }
];

// Préstamos activos
let prestamos =
    JSON.parse(sessionStorage.getItem("prestamos")) || [];

// Guardar los cambios
const guardar = () => {
    sessionStorage.setItem("libros", JSON.stringify(libros));
    sessionStorage.setItem("prestamos", JSON.stringify(prestamos));
};


/* ENCABEZADOS DE LAS TABLAS */

if ($("cab-catalogo")) {
    $("cab-catalogo").innerHTML = `
        <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Género</th>
            <th>Estado</th>
            <th></th>
        </tr>`;
}

if ($("cab-prestamos")) {
    $("cab-prestamos").innerHTML = `
        <tr>
            <th>Libro</th>
            <th>Lector</th>
            <th>Carnet</th>
            <th>Devolver el</th>
            <th></th>
        </tr>`;
}


/* PÁGINA DE INICIO Y CONTADORES */

function renderInicio() {
    $("stats").innerHTML = `
        <div class="stat s1">
            <strong>${libros.length}</strong>
            Ejemplares
        </div>

        <div class="stat s2">
            <strong>
                ${libros.filter(libro => libro.disponible).length}
            </strong>
            Disponibles
        </div>

        <div class="stat s3">
            <strong>${prestamos.length}</strong>
            Prestados
        </div>
    `;
}


/* CATÁLOGO DE LIBROS */

function renderCatalogo() {
    const busqueda = $("buscar-catalogo")
        .value.trim().toLowerCase();

    const lista = libros
        .map((libro, indice) => ({
            ...libro,
            indice
        }))
        .filter(libro =>
            (libro.titulo + " " + libro.autor)
                .toLowerCase()
                .includes(busqueda)
        );

    $("tabla-catalogo").innerHTML = lista.length
        ? lista.map(libro => `
            <tr>
                <td>
                    <strong>${esc(libro.titulo)}</strong>
                    <br>
                    <small>${libro.anio}</small>
                </td>

                <td>${esc(libro.autor)}</td>
                <td>${esc(libro.genero)}</td>

                <td>
                    <span class="badge ${
                        libro.disponible ? "ok" : "pres"
                    }">
                        ${libro.disponible
                            ? "Disponible"
                            : "Prestado"}
                    </span>
                </td>

                <td>
                    ${libro.disponible
                        ? `<button class="borrar"
                             data-i="${libro.indice}">
                             Eliminar
                           </button>`
                        : ""}
                </td>
            </tr>
        `).join("")
        : `<tr>
             <td colspan="5">
                No hay libros que coincidan.
             </td>
           </tr>`;
}

// Buscar por título o autor
if ($("buscar-catalogo")) {
    $("buscar-catalogo").addEventListener(
        "input",
        renderCatalogo
    );
}

// Eliminar libros disponibles
if ($("tabla-catalogo")) {
    $("tabla-catalogo").addEventListener("click", evento => {
        const boton = evento.target.closest("[data-i]");
        if (!boton) return;

        const indice = Number(boton.dataset.i);

        if (
            !Number.isInteger(indice) ||
            !libros[indice] ||
            !libros[indice].disponible
        ) {
            return;
        }

        libros.splice(indice, 1);
        guardar();
        render();
    });
}


/* REGISTRAR NUEVOS LIBROS */

if ($("formLibro")) {
    $("formLibro").addEventListener("submit", evento => {
        evento.preventDefault();

        const libro = {
            titulo: $("titulo").value.trim(),
            autor: $("autor").value.trim(),
            genero: $("genero").value,
            anio: Number($("anio").value)
        };

        limpiar([
            "errTitulo",
            "errAutor",
            "errGenero",
            "errAnio"
        ]);

        let valido = true;

        if (!libro.titulo) {
            $("errTitulo").textContent =
                "Escribe el título.";
            valido = false;
        }

        if (!libro.autor) {
            $("errAutor").textContent =
                "Escribe el autor.";
            valido = false;
        }

        if (!libro.genero) {
            $("errGenero").textContent =
                "Selecciona el género.";
            valido = false;
        }

        if (
            !Number.isInteger(libro.anio) ||
            libro.anio < 1450 ||
            libro.anio > 2026
        ) {
            $("errAnio").textContent =
                "Escribe un año entre 1450 y 2026.";
            valido = false;
        }

        if (!valido) return;

        libros.push({
            ...libro,
            disponible: true
        });

        guardar();
        evento.target.reset();
        render();
    });
}


/* PRÉSTAMOS Y DEVOLUCIONES */

function renderPrestamos() {
    const disponibles = libros.filter(
        libro => libro.disponible
    );

    $("libro").innerHTML = disponibles.length
        ? disponibles.map(libro => `
            <option value="${esc(libro.titulo)}">
                ${esc(libro.titulo)}
            </option>
        `).join("")
        : `<option value="">No hay libros disponibles</option>`;

    $("tabla-prestamos").innerHTML = prestamos.length
        ? prestamos.map((prestamo, indice) => `
            <tr>
                <td><strong>${esc(prestamo.titulo)}</strong></td>
                <td>${esc(prestamo.lector)}</td>
                <td>${esc(prestamo.carnet)}</td>
                <td>${esc(prestamo.devolucion)}</td>
                <td>
                    <button class="accion" data-i="${indice}">
                        Devolver
                    </button>
                </td>
            </tr>
        `).join("")
        : `<tr>
             <td colspan="5">No hay préstamos activos.</td>
           </tr>`;
}

// Registrar un préstamo
if ($("formPrestamo")) {
    $("formPrestamo").addEventListener("submit", evento => {
        evento.preventDefault();

        const titulo = $("libro").value;
        const lector = $("lector").value.trim();
        const carnet = $("carnet").value.trim();
        const devolucion = $("devolucion").value;

        const maximo = new Date(
            Date.now() + 30 * 86400000
        ).toISOString().slice(0, 10);

        limpiar([
            "errLibro",
            "errLector",
            "errCarnet",
            "errDevolucion"
        ]);

        let valido = true;

        if (!titulo || !libros.some(
            libro => libro.titulo === titulo && libro.disponible
        )) {
            $("errLibro").textContent =
                "Selecciona un libro disponible.";
            valido = false;
        }

        if (lector.length < 3) {
            $("errLector").textContent =
                "Escribe el nombre completo del lector.";
            valido = false;
        }

        if (!/^\d{7,8}$/.test(carnet)) {
            $("errCarnet").textContent =
                "El carnet debe tener 7 u 8 dígitos.";
            valido = false;
        }

        if (!devolucion) {
            $("errDevolucion").textContent =
                "Selecciona la fecha de devolución.";
            valido = false;
        } else if (
            devolucion <= hoy ||
            devolucion > maximo
        ) {
            $("errDevolucion").textContent =
                "Debe ser entre mañana y 30 días desde hoy.";
            valido = false;
        }

        if (!valido) return;

        const libro = libros.find(
            elemento =>
                elemento.titulo === titulo &&
                elemento.disponible
        );

        libro.disponible = false;

        prestamos.push({
            titulo,
            lector,
            carnet,
            devolucion
        });

        guardar();
        evento.target.reset();
        render();
    });
}

// Devolver un libro prestado
if ($("tabla-prestamos")) {
    $("tabla-prestamos").addEventListener("click", evento => {
        const boton = evento.target.closest("[data-i]");
        if (!boton) return;

        const indice = Number(boton.dataset.i);

        if (
            !Number.isInteger(indice) ||
            !prestamos[indice]
        ) {
            return;
        }

        const prestamo = prestamos[indice];

        const libro = libros.find(
            elemento => elemento.titulo === prestamo.titulo
        );

        if (libro) {
            libro.disponible = true;
        }

        prestamos.splice(indice, 1);

        guardar();
        render();
    });
}


/* ACTUALIZAR LAS VISTAS */

function render() {
    if ($("stats")) {
        renderInicio();
    }

    if ($("tabla-catalogo")) {
        renderCatalogo();
    }

    if ($("tabla-prestamos")) {
        renderPrestamos();
    }
}

// Mostrar los datos al abrir cada página
render();
