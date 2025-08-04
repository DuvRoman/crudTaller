const d = document;
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = -1;

const clientePro = d.querySelector("#clientePro");
const productoPro = d.querySelector("#productoPro");
const precioPro = d.querySelector("#precioPro");
const imagenPro = d.querySelector("#imagenPro");
const descripcionPro = d.querySelector("#descripcionPro");
const btnGuardar = d.querySelector(".btnGuardar");
const btnEditar = d.querySelector(".btnEditar");
const tabla = d.querySelector("#tablaBody");
const buscador = d.querySelector("#buscador");

const limpiarFormulario = () => {
  clientePro.value = "";
  productoPro.value = "Pizza";
  precioPro.value = "";
  imagenPro.value = "";
  descripcionPro.value = "";
};

const guardarDatos = () => {
  if (
    !clientePro.value.trim() ||
    !productoPro.value.trim() ||
    !precioPro.value.trim() ||
    !imagenPro.value.trim() ||
    !descripcionPro.value.trim()
  ) {
    alert("Todos los campos son obligatorios");
    return;
  }

  if (isNaN(precioPro.value) || Number(precioPro.value) <= 0) {
    alert("El precio debe ser un número válido y mayor que 0");
    return;
  }

  const producto = {
    cliente: clientePro.value.trim(),
    producto: productoPro.value.trim(),
    precio: parseFloat(precioPro.value.trim()).toFixed(2),
    imagen: imagenPro.value.trim(),
    descripcion: descripcionPro.value.trim(),
  };

  productos.push(producto);
  localStorage.setItem("productos", JSON.stringify(productos));
  alert("Producto guardado con éxito ✅");
  mostrarDatos();
  limpiarFormulario();
};

function mostrarDatos(filtro = "") {
  tabla.innerHTML = ""; // limpiar tabla

  // Filtrar productos por nombre del producto (campo "producto")
  const productosFiltrados = productos.filter((p) =>
    p.producto.toLowerCase().includes(filtro.toLowerCase())
  );

  productosFiltrados.forEach((prod, i) => {
    tabla.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${prod.cliente}</td>
        <td>${prod.producto}</td>
        <td>$${prod.precio}</td>
        <td>${prod.descripcion}</td>
        <td><img src="${prod.imagen}" width="60" height="60" style="object-fit:cover;"></td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarPedido(${i})">📝</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarPedido(${i})">❌</button>
          <button class="btn btn-success btn-sm" onclick="exportarPDF('${prod.producto}', '${prod.precio}', '${prod.descripcion}', '${prod.imagen}')">📄</button>
        </td>
      </tr>
    `;
  });
}

const eliminarPedido = (i) => {
  if (confirm(`¿Eliminar pedido del cliente: ${productos[i].cliente}?`)) {
    productos.splice(i, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarDatos(buscador.value);
  }
};

const editarPedido = (i) => {
  const prod = productos[i];
  clientePro.value = prod.cliente;
  productoPro.value = prod.producto;
  precioPro.value = prod.precio;
  imagenPro.value = prod.imagen;
  descripcionPro.value = prod.descripcion;
  editIndex = i;
  btnGuardar.classList.add("d-none");
  btnEditar.classList.remove("d-none");
};

const actualizarPedido = () => {
  if (
    !clientePro.value.trim() ||
    !productoPro.value.trim() ||
    !precioPro.value.trim() ||
    !imagenPro.value.trim() ||
    !descripcionPro.value.trim()
  ) {
    alert("Todos los campos son obligatorios");
    return;
  }

  if (isNaN(precioPro.value) || Number(precioPro.value) <= 0) {
    alert("El precio debe ser un número válido y mayor que 0");
    return;
  }

  productos[editIndex] = {
    cliente: clientePro.value.trim(),
    producto: productoPro.value.trim(),
    precio: parseFloat(precioPro.value.trim()).toFixed(2),
    imagen: imagenPro.value.trim(),
    descripcion: descripcionPro.value.trim(),
  };
  localStorage.setItem("productos", JSON.stringify(productos));
  alert("Pedido actualizado con éxito ✅");
  mostrarDatos(buscador.value);
  limpiarFormulario();
  btnEditar.classList.add("d-none");
  btnGuardar.classList.remove("d-none");
  editIndex = -1;
  document.getElementById("tablaBody").scrollIntoView({ behavior: "smooth" });
};

const exportarPDF = (nombre, precio, descripcion, imagenUrl) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Resumen de Producto", 20, 20);
  doc.setFontSize(12);
  doc.text(`Nombre: ${nombre}`, 20, 40);
  doc.text(`Precio: $${precio}`, 20, 50);
  doc.text(`Descripción: ${descripcion}`, 20, 60);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imagenUrl;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 20, 70, 60, 60);
    doc.save(`${nombre}_producto.pdf`);
  };

  img.onerror = () => {
    alert("No se pudo cargar la imagen para el PDF.");
    doc.save(`${nombre}_producto_sin_imagen.pdf`);
  };
};

// Exponer funciones globales para botones dinámicos
window.editarPedido = editarPedido;
window.eliminarPedido = eliminarPedido;
window.exportarPDF = exportarPDF;

btnGuardar.addEventListener("click", guardarDatos);
btnEditar.addEventListener("click", actualizarPedido);
document.addEventListener("DOMContentLoaded", () => mostrarDatos());

// Evento para búsqueda en tiempo real
buscador.addEventListener("input", (e) => {
  mostrarDatos(e.target.value);
});