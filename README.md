# Reclaim v1.0.0

<div align="center">
  <img src="public/logo.svg" alt="Reclaim Logo" width="80" height="80">
  <h3>Análisis financiero inteligente con IA</h3>
  <p>Importa tus datos de MercadoPago y descubre insights sobre tus finanzas personales</p>
</div>

## 📱 Vista previa

<div align="center">
  <img src="public/home-dark.png" alt="Dashboard financiero" width="800">
</div>

## ✨ ¿Qué hace Reclaim?

Reclaim es una plataforma de análisis financiero personal que transforma tus datos de MercadoPago en insights accionables:

### 🎯 Características principales
- 📊 **Dashboard financiero completo** con métricas en tiempo real
- 🤖 **Pronósticos inteligentes** del próximo mes con IA
- 📈 **Análisis de tendencias** y patrones de gasto
- 🚨 **Alertas inteligentes** para gastos inusuales
- 💡 **Recomendaciones personalizadas** basadas en tus hábitos
- 📁 **Importación múltiple**: JSON, CSV, ZIP y carpetas completas
- 🌓 **Modo oscuro** y diseño responsive
- 📤 **Exportación** de reportes en CSV

### 🧠 Inteligencia Artificial integrada
- **Clasificación automática** de transacciones por categorías
- **Detección de anomalías** en gastos
- **Pronósticos financieros** con intervalos de confianza
- **Recomendaciones** basadas en machine learning básico

## 🚀 Instalación

Necesitas tener Node.js instalado en tu computadora.

```bash
# Descarga el proyecto
git clone https://github.com/tu-usuario/reclaim.git
cd reclaim

# Instala las dependencias
pnpm install

# Ejecuta la aplicación
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Cómo usar

### 1. Obtén tus datos de MercadoPago

**Método recomendado (datos completos):**
- Ve a [mercadopago.com.ar](https://mercadopago.com.ar)
- Inicia sesión en tu cuenta
- Ve a **Tu perfil** → **Privacidad** → **Solicitar reporte**
- Selecciona **"Tus movimientos de dinero"**
- Espera el email con el archivo ZIP (puede tardar horas/días)
- Extrae el ZIP y busca la carpeta `Movimientos de dinero`

**Método alternativo (datos recientes):**
- Desde la app de MercadoPago → **Configuración** → **Exportar datos**

### 2. Importa en Reclaim

- **Arrastra archivos** JSON, CSV o carpetas completas
- **O haz clic** en "Seleccionar archivos"
- Reclaim procesa automáticamente todos los formatos de MercadoPago

### 3. Explora tus finanzas

- **Dashboard principal**: Métricas generales y saldo
- **Pronósticos**: Predicciones del próximo mes
- **Análisis de gastos**: Tendencias por categoría
- **Alertas**: Notificaciones de gastos inusuales
- **Recomendaciones**: Consejos personalizados

## 🎨 Funcionalidades avanzadas

### 📈 Análisis inteligente
- **Regresión lineal** para detectar tendencias
- **Coeficiente de variación** para medir estabilidad
- **Análisis de percentiles** para identificar outliers
- **Clasificación automática** por tipo de gasto

### 📊 Visualizaciones
- **Gráficos de barras** para comparación mensual
- **Gráficos de líneas** para evolución temporal
- **Distribución por categorías** con pie charts
- **Filtros avanzados** por fecha y categoría

### 🔒 Privacidad y seguridad
- **Procesamiento local**: Tus datos nunca salen de tu dispositivo
- **No requiere cuenta**: Funciona completamente offline
- **Exportación opcional**: Control total sobre tus datos

## 🤝 Contribuir

Si querés mejorar Reclaim o encontraste un problema:

1. **Issues**: Reporta bugs o solicita features
2. **Pull requests**: Envía mejoras al código
3. **Discusiones**: Comparte ideas para nuevas funcionalidades

### Áreas de mejora sugeridas:
- Soporte para otros bancos (Santander, Galicia, BBVA)
- Sincronización automática con APIs
- Presupuestos personalizables
- Análisis de inversiones
- Integración con otras fuentes de datos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <p>🧠 Hecho con IA para potenciar tus finanzas personales</p>
  <p>⭐ Si te gusta Reclaim, ¡dale una estrella en GitHub!</p>
</div>