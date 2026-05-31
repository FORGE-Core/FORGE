export const currentUser = {
  name: "Camila",
  fullName: "Camila Rodríguez",
  role: "Operadora de Logística",
  company: "LogiExpress MX",
  level: 4,
  levelTitle: "Operador Certificado",
  overallProgress: 72,
  avatarInitials: "CR",
};

export const dashboardKpis = [
  { title: "Módulos completados", value: "12", change: "+2 este mes", trend: "up" as const, icon: "book" },
  { title: "Módulos pendientes", value: "3", change: "Prioridad alta", trend: "neutral" as const, icon: "clock" },
  { title: "Horas de capacitación", value: "18h", change: "+4h vs mes anterior", trend: "up" as const, icon: "time" },
  { title: "Actividades realizadas", value: "48", change: "12 esta semana", trend: "up" as const, icon: "zap" },
  { title: "Puntaje promedio", value: "92%", change: "+3% mejora", trend: "up" as const, icon: "target" },
  { title: "Tiempo ahorrado", value: "6.5h", change: "vs capacitación tradicional", trend: "up" as const, icon: "sparkles" },
];

export const recentActivity = [
  { id: "1", text: 'Terminaste "Proceso de devoluciones"', time: "Hace 2 horas", type: "complete" },
  { id: "2", text: "Completaste quiz de inventario", time: "Ayer", type: "quiz" },
  { id: "3", text: "Consultaste a la IA sobre envíos", time: "Ayer", type: "ai" },
  { id: "4", text: "Realizaste simulación de entregas", time: "Hace 3 días", type: "sim" },
];

export const aiRecommendations = [
  { topic: "Gestión de devoluciones", reason: "Tu puntaje fue 71% — por debajo del promedio del equipo" },
  { topic: "Control de inventario", reason: "3 errores recurrentes detectados en actividades recientes" },
];

export const trainingModules = [
  {
    slug: "gestion-envios",
    title: "Gestión de envíos",
    category: "Logística",
    level: "Intermedio",
    duration: "2h 30m",
    status: "in_progress" as const,
    progress: 80,
    gradient: "from-indigo-500 to-violet-600",
    description: "Aprende el flujo completo de despacho, tracking y resolución de incidencias.",
  },
  {
    slug: "manejo-devoluciones",
    title: "Manejo de devoluciones",
    category: "Operaciones",
    level: "Básico",
    duration: "1h 20m",
    status: "pending" as const,
    progress: 0,
    gradient: "from-amber-500 to-orange-600",
    description: "Procesos de RMA, validación y comunicación con clientes.",
  },
  {
    slug: "control-inventarios",
    title: "Control de inventarios",
    category: "Almacén",
    level: "Avanzado",
    duration: "3h",
    status: "in_progress" as const,
    progress: 45,
    gradient: "from-emerald-500 to-teal-600",
    description: "Conteos cíclicos, ajustes y reconciliación de stock.",
  },
  {
    slug: "atencion-cliente-b2b",
    title: "Atención al cliente B2B",
    category: "Servicio",
    level: "Intermedio",
    duration: "1h 45m",
    status: "completed" as const,
    progress: 100,
    gradient: "from-rose-500 to-pink-600",
    description: "Protocolos de comunicación y escalamiento profesional.",
  },
  {
    slug: "seguridad-almacen",
    title: "Seguridad en almacén",
    category: "Compliance",
    level: "Básico",
    duration: "1h",
    status: "completed" as const,
    progress: 100,
    gradient: "from-slate-600 to-slate-800",
    description: "EPP, rutas seguras y prevención de accidentes.",
  },
  {
    slug: "despacho-ultima-milla",
    title: "Despacho última milla",
    category: "Logística",
    level: "Avanzado",
    duration: "2h 15m",
    status: "in_progress" as const,
    progress: 30,
    gradient: "from-cyan-500 to-blue-600",
    description: "Optimización de rutas y entregas en zona metropolitana.",
  },
];

export const moduleLessons = [
  { id: "1", title: "Introducción", duration: "8 min", completed: true },
  { id: "2", title: "Flujo operativo", duration: "22 min", completed: true },
  { id: "3", title: "Casos frecuentes", duration: "18 min", completed: true },
  { id: "4", title: "Errores comunes", duration: "15 min", completed: false, current: true },
  { id: "5", title: "Evaluación", duration: "12 min", completed: false },
];

export const moduleResources = [
  { name: "Manual operativo PDF", type: "pdf" },
  { name: "Procedimiento actualizado", type: "doc" },
  { name: "Video de apoyo", type: "video" },
  { name: "Preguntas frecuentes", type: "faq" },
];

export const chatSuggestions = [
  "¿Cómo registrar una devolución?",
  "¿Qué hago si un paquete se pierde?",
  "¿Cómo actualizar un inventario?",
  "Explícame el proceso de despacho.",
];

export const chatSidebarDocs = [
  { name: "Manual_Devoluciones_v3.pdf", used: true },
  { name: "Procedimiento_Envios_2026.pdf", used: true },
  { name: "FAQ_Inventario.pdf", used: false },
];

export const quizQuestion = {
  current: 3,
  total: 10,
  question: "¿Cuál es el primer paso al recibir una devolución sin etiqueta?",
  options: [
    { id: "a", text: "Escalar inmediatamente al supervisor", correct: false },
    { id: "b", text: "Verificar el número de pedido en el sistema", correct: true },
    { id: "c", text: "Rechazar el paquete en mostrador", correct: false },
    { id: "d", text: "Enviar el paquete a almacén general", correct: false },
  ],
  explanation:
    "Siempre debes verificar el pedido en el sistema antes de cualquier acción. Esto evita errores de inventario y reclamos duplicados.",
};

export const simulation = {
  title: "Paquete no entregado",
  scenario:
    "Un cliente reporta que su paquete no llegó. El tracking muestra «entregado» pero el cliente insiste que no lo recibió.",
  options: [
    { id: "a", label: "A", text: "Escalar inmediatamente", score: 20 },
    { id: "b", label: "B", text: "Verificar estado del envío y evidencia de entrega", score: 100 },
    { id: "c", label: "C", text: "Crear nuevo pedido sin investigar", score: 10 },
    { id: "d", label: "D", text: "Cancelar el proceso", score: 0 },
  ],
  aiAnalysis:
    "La opción correcta prioriza verificación antes de acciones irreversibles. En el 78% de casos similares, el problema se resuelve revisando POD y geolocalización.",
};

export const reportMetrics = [
  { label: "Usuarios activos", value: "128", change: "+12%" },
  { label: "Progreso promedio", value: "72%", change: "+5%" },
  { label: "Módulos completados", value: "847", change: "+18%" },
  { label: "Actividades realizadas", value: "2,340", change: "+24%" },
];

export const reportInsights = [
  "47% de usuarios falla en devoluciones.",
  "33% tiene dificultades con inventarios.",
  "El proceso de despacho genera más consultas a la IA.",
];

export const reportRecommendations = [
  "Actualizar módulo de devoluciones con casos reales Q1.",
  "Crear nueva simulación de inventario para turno nocturno.",
  "Reforzar capacitación de despacho con video corto.",
];

export const documents = [
  {
    name: "Manual_Operativo.pdf",
    status: "ready" as const,
    chunks: 523,
    embeddings: true,
    aiReady: true,
    uploadedAt: "28 may 2026",
  },
  {
    name: "Procedimiento_Devoluciones.pdf",
    status: "ready" as const,
    chunks: 312,
    embeddings: true,
    aiReady: true,
    uploadedAt: "25 may 2026",
  },
  {
    name: "Guia_Inventario_2026.pdf",
    status: "processing" as const,
    chunks: 0,
    embeddings: false,
    aiReady: false,
    uploadedAt: "Hoy",
  },
];

export const profileSkills = [
  { name: "Gestión de envíos", pct: 95 },
  { name: "Inventario", pct: 84 },
  { name: "Devoluciones", pct: 71 },
  { name: "Atención al cliente", pct: 88 },
];

export const profileAchievements = [
  { title: "Primer módulo completado", icon: "🎯" },
  { title: "10 actividades aprobadas", icon: "⚡" },
  { title: "Experto en envíos", icon: "📦" },
  { title: "Aprendiz destacado", icon: "⭐" },
];
