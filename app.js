const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwHv2w2GNdC1ArqN6a0LFw62jbYT241XDX56TzRakwH_gtEwfJZ7uHzpSXr2T6ilzoR/exec";

let citas = JSON.parse(localStorage.getItem("citas")) || [];

// Mostrar u ocultar registro empresa
window.onload = () => {
  const empresa = JSON.parse(localStorage.getItem("empresa"));
  if (empresa) {
    document.getElementById("empresaContainer").style.display = "none";
    document.getElementById("citaContainer").style.display = "block";
    mostrarCitas();
  }
};

// Guardar empresa
document.getElementById("formEmpresa")?.addEventListener("submit", e => {
  e.preventDefault();
  const empresa = {
    nombre: document.getElementById("nombreEmpresa").value,
    correo: document.getElementById("correoEmpresa").value,
    pais: document.getElementById("paisEmpresa").value,
    whatsapp: document.getElementById("whatsappEmpresa").value,
    ubicacion: document.getElementById("ubicacionEmpresa").value
  };
  localStorage.setItem("empresa", JSON.stringify(empresa));
  document.getElementById("empresaContainer").style.display = "none";
  document.getElementById("citaContainer").style.display = "block";
});

// Guardar cita
document.getElementById("formCita")?.addEventListener("submit", e => {
  e.preventDefault();
  const cita = {
    nombre: document.getElementById("nombrePaciente").value,
    fecha: document.getElementById("fechaCita").value,
    whatsapp: document.getElementById("whatsappPaciente").value,
    edad: document.getElementById("edadPaciente").value,
    procedimiento: document.getElementById("procedimiento").value,
    empresa: JSON.parse(localStorage.getItem("empresa")) || {}
  };

  citas.push(cita);
  localStorage.setItem("citas", JSON.stringify(citas));

  enviarCitaAGoogleSheets(cita);
  enviarWhatsApp(cita);

  mostrarCitas();
  alert("Cita registrada con éxito.");
});

// Mostrar citas
function mostrarCitas() {
  const lista = document.getElementById("listaCitas");
  lista.innerHTML = "";

  citas.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
  const proximas = citas.slice(0,6);

  proximas.forEach((cita, index) => {
    const li = document.createElement("li");
    li.textContent = `${cita.fecha} - ${cita.nombre} - ${cita.procedimiento}`;

    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.onclick = () => eliminarCita(index);
    li.appendChild(btn);

    lista.appendChild(li);
  });
}

// Eliminar cita
function eliminarCita(index) {
  citas.splice(index,1);
  localStorage.setItem("citas", JSON.stringify(citas));
  mostrarCitas();
}

// Enviar a Google Sheets
async function enviarCitaAGoogleSheets(cita) {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(cita)
    });
    const data = await response.json();
    console.log("Respuesta Google Sheets:", data);
  } catch (err) {
    console.error("Error Sheets:", err);
  }
}

// Enviar WhatsApp
function enviarWhatsApp(cita) {
  const empresa = JSON.parse(localStorage.getItem("empresa")) || {};
  const mensaje = `Hola ${cita.nombre}, su cita para el procedimiento ${cita.procedimiento} está agendada el ${cita.fecha}. Atentamente ${empresa.nombre}`;
  const url = `https://wa.me/${cita.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}
