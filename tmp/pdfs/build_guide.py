from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Preformatted, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/pdf/FitPulse_Guia_de_Estudio_y_Defensa.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
fonts = Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('Guide', str(fonts/'arial.ttf')))
pdfmetrics.registerFont(TTFont('GuideBold', str(fonts/'arialbd.ttf')))
pdfmetrics.registerFontFamily('Guide', normal='Guide', bold='GuideBold', italic='Guide', boldItalic='GuideBold')
ORANGE=colors.HexColor('#EA580C'); INK=colors.HexColor('#172335'); GREY=colors.HexColor('#526174')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyG',fontName='Guide',fontSize=10.2,leading=15,textColor=INK,spaceAfter=9))
styles.add(ParagraphStyle(name='H1G',fontName='GuideBold',fontSize=23,leading=28,textColor=INK,spaceAfter=17))
styles.add(ParagraphStyle(name='H2G',fontName='GuideBold',fontSize=12,leading=16,textColor=ORANGE,spaceBefore=10,spaceAfter=7,keepWithNext=True))
styles.add(ParagraphStyle(name='SmallG',fontName='Guide',fontSize=8.5,leading=12,textColor=GREY,spaceAfter=6))
styles.add(ParagraphStyle(name='CoverG',fontName='GuideBold',fontSize=42,leading=48,textColor=INK,spaceAfter=16))
styles.add(ParagraphStyle(name='CodeG',fontName='Courier',fontSize=8.1,leading=11,textColor=INK,backColor=colors.HexColor('#F1F5F9'),borderPadding=10,spaceBefore=8,spaceAfter=14))
story=[]
def p(t): story.append(Paragraph(t, styles['BodyG']))
def h(t): story.append(Paragraph(t, styles['H2G']))
def code(t): story.append(Preformatted(t,styles['CodeG']))
def section(n,title):
    if story: story.append(PageBreak())
    story.append(Paragraph(f'GUÍA DE ESTUDIO / {n:02}',styles['SmallG']))
    story.append(Paragraph(title,styles['H1G']))
def bullets(items):
    for item in items: p('• '+item)
def table(rows,widths):
    data=[[Paragraph(escape(str(c)),styles['SmallG']) for c in row] for row in rows]
    t=Table(data,colWidths=widths,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#FFF0E5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,-1),0.4,colors.HexColor('#DDE3EA'))]))
    story.append(t); story.append(Spacer(1,10))
def qa(n,q,a):
    story.append(KeepTogether([Paragraph(f'{n}. {q}',styles['H2G']),Paragraph(a,styles['BodyG'])]))

story.append(Spacer(1,42))
story.append(Paragraph('DESARROLLO DE APLICACIONES MÓVILES',styles['SmallG']))
story.append(Paragraph('FitPulse',styles['CoverG']))
story.append(Paragraph('Guía del proyecto y preparación para la defensa oral',styles['H1G']))
p('Una explicación de la arquitectura, los modelos de datos, la lógica de rutinas y calorías, y las preguntas técnicas que conviene dominar.')
story.append(Spacer(1,18))
table([['Proyecto','Aplicación móvil de fitness y nutrición'],['Tecnologías principales','Expo 54 · React Native 0.81.5 · React 19.1 · TypeScript'],['Fecha de preparación','7 de octubre de 2026'],['Base del contenido','Código revisado del repositorio y documentación de Expo SDK 54']],[140,355])
h('La idea central')
p('<b>La aplicación administra rutinas y alimentos mediante estado local de React.</b> El usuario puede crear, editar y eliminar rutinas, y registrar calorías. Todavía no hay almacenamiento permanente, autenticación ni sesiones reales de entrenamiento.')
h('Cómo utilizar esta guía')
p('Estudia primero las secciones 1 a 7. Después practica las 30 preguntas de las secciones 8 a 10 sin leer las respuestas. Explica cada concepto con un ejemplo del código y reconoce las funciones pendientes.')
p('<b>Advertencia documental:</b> el README menciona SDK 57, pero package.json declara Expo ~54.0.37. Esta guía describe la aplicación principal de la raíz, no la plantilla independiente my-expo-app.')

section(1,'Arquitectura y navegación')
p('FitPulse tiene cuatro pestañas. Entrenos y Calorías contienen la lógica funcional principal; Inicio y Perfil muestran datos de ejemplo.')
code('expo-router/entry\n  src/app/_layout.tsx        Stack global\n    src/app/(tabs)/_layout.tsx\n      index.tsx              Inicio\n      entrenos.tsx           Rutinas\n      progreso.tsx           Calorías\n      perfil.tsx             Perfil')
table([['Ubicación','Responsabilidad'],['src/app/','Pantallas y layouts de navegación.'],['src/components/','Formulario de rutinas y selector de ejercicios.'],['src/store/','Interfaces, tipos, catálogo y datos iniciales.'],['assets/','Imágenes e iconos locales.'],['my-expo-app/','Proyecto independiente de plantilla; declara Expo SDK 56.']],[150,345])
h('Los dos layouts')
p('<b>Layout raíz:</b> importa global.css, configura un Stack sin encabezado y registra el grupo (tabs). También solicita ocultar la barra de navegación del sistema en Android.')
p('<b>Layout de pestañas:</b> configura Tabs.Screen para Inicio, Entrenos, Calorías y Perfil. Define iconos, colores activos e inactivos, y espaciado por plataforma.')
p('Los paréntesis de (tabs) indican un grupo de rutas y no forman parte del camino de navegación. El archivo progreso.tsx tiene ese nombre, aunque su título visible es Calorías.')
h('Inicio y Perfil')
p('Inicio muestra una meta semanal fija, un entrenamiento recomendado y el texto de prueba "holaaaaa". Perfil muestra un usuario y correo de ejemplo. Sus opciones no tienen onPress, así que no abren vistas ni ejecutan acciones.')
p('La entrada de la aplicación principal es expo-router/entry. El App.tsx de my-expo-app no es su punto de entrada. Esa carpeta está excluida del tsconfig principal.')

section(2,'Modelos de datos y estado')
code('Rutina\n  id: string\n  nombre: string\n  ejercicios: Ejercicio[]\n    id, nombre, detalle?, imagen?\n    series: Serie[]\n      id: string\n      numeroSerie: number\n      peso: number\n      repeticiones: number')
p('routines.store.ts define las interfaces Serie, Ejercicio y Rutina. rutinasIniciales es un arreglo vacío. exercises.store.ts define EjercicioCatalogo y cinco ejercicios con imágenes locales.')
code('type TipoComida = "Desayuno" | "Almuerzo" | "Cena" | "Snack";\n\ninterface Alimento {\n  id: string;\n  nombre: string;\n  calorias: number;\n  tipoComida: TipoComida;\n  hora: string;\n}')
h('Qué aportan los tipos')
p('Una interface describe la estructura esperada de un objeto. El signo ? indica una propiedad opcional; [] indica un arreglo y | permite alternativas. Los tipos comprueban el código durante el desarrollo, pero no validan automáticamente la entrada del usuario.')
p('La propiedad imagen usa any en el código actual. Esto reduce las comprobaciones de tipos; no es una exigencia general de React Native.')
h('Estado local, no almacenamiento permanente')
code('const [rutinas, setRutinas] =\n  useState<Rutina[]>(rutinasIniciales);')
p('rutinas contiene la lista actual y setRutinas la actualiza. React vuelve a renderizar el componente al actualizar su estado. Los archivos llamados store exportan modelos y valores iniciales; no implementan un estado global ni una base de datos.')
p('<b>Consecuencia:</b> el estado dura mientras se mantiene esa instancia de la aplicación. Al reiniciar, se recuperan los valores iniciales. Inicio no recibe automáticamente un resumen de los cambios de Entrenos.')

section(3,'Entrenos: el flujo CRUD')
p('CRUD significa crear, leer, actualizar y eliminar. entrenos.tsx administra la lista de rutinas, la rutina a editar, la visibilidad del formulario, el menú de opciones y el banner.')
h('Crear o editar')
p('rutinaAEditar vale null al crear y contiene una Rutina al editar. abrirModalCrear limpia la selección; abrirModalEditar precarga la rutina elegida y cierra el menú de opciones.')
code('if (rutinaAEditar) {\n  setRutinas(\n    rutinas.map((r) =>\n      r.id === rutinaGuardada.id ? rutinaGuardada : r\n    )\n  );\n} else {\n  setRutinas([rutinaGuardada, ...rutinas]);\n}')
p('Al editar, map conserva cada rutina salvo la que tiene el mismo ID, que se reemplaza por la guardada. Al crear, el operador spread conserva los elementos anteriores y agrega la nueva al principio.')
h('Eliminar')
code('setRutinas(rutinas.filter((r) => r.id !== rutina.id));')
p('Después de una confirmación, filter construye un arreglo que excluye la rutina seleccionada. El ID se utiliza para identificar el objeto, no su nombre, que podría repetirse.')
h('Visualización y funciones pendientes')
p('Cada tarjeta utiliza key={rutina.id}, muestra hasta tres ejercicios con slice(0, 3) e indica si hay más. Si no existen rutinas, aparece un estado vacío con una acción para crear la primera.')
p('Empezar Rutina y Empezar Entrenamiento Vacío solo muestran un Alert. Explorar también es una simulación. El botón de refrescar no tiene acción y el banner anuncia reordenamiento sin una implementación asociada.')
h('Inmutabilidad')
p('map, filter y spread crean estructuras nuevas. Evitar modificar directamente el estado facilita que React identifique cambios y reduce alteraciones accidentales de datos compartidos. Cuando el nuevo estado depende del anterior, una actualización funcional con el valor previo es una alternativa robusta.')

section(4,'El formulario de rutinas')
p('RoutineModal.tsx contiene ModalRutina, el componente con la lógica más compleja. Recibe props desde Entrenos y mantiene un borrador local del nombre y los ejercicios.')
code('interface PropiedadesModalRutina {\n  visible: boolean;\n  rutinaAEditar: Rutina | null;\n  alGuardar: (rutina: Rutina) => void;\n  alCerrar: () => void;\n}')
p('Al abrirse, onShow prepara el formulario. En edición, copia los ejercicios con JSON.parse(JSON.stringify(...)); en creación, precarga el primer ejercicio del catálogo con tres series de 20 kg y 10 repeticiones.')
p('La copia separa el borrador del original. JSON sirve para los datos simples actuales, pero no conserva todos los tipos de JavaScript. Una copia explícita de ejercicios y series haría más clara esta estructura.')
table([['Función','Comportamiento'],['alSeleccionarEjercicio','Añade un ejercicio con tres series iniciales.'],['agregarSerie','Copia peso y repeticiones de la última serie.'],['eliminarSerie','Evita quitar la última y renumera las restantes.'],['eliminarEjercicio','Evita quitar el último ejercicio.'],['actualizarPesoSerie / repeticiones','Actualiza una serie del ejercicio seleccionado.'],['guardarRutina','Valida nombre y ejercicios; conserva o genera el ID.']],[210,285])
h('La actualización anidada más importante')
code('return {\n  ...ej,\n  series: ej.series.map((s) =>\n    s.id === idSerie ? { ...s, peso: valorPeso } : s\n  ),\n};')
p('Dentro del map de ejercicios, esta expresión crea un ejercicio nuevo, un arreglo nuevo de series y una serie nueva con el peso actualizado. Las demás propiedades se conservan.')
p('Al guardar, alGuardar(rutinaGuardada) devuelve el resultado a Entrenos. Al cancelar, el borrador no se incorpora a la lista principal. Los valores numéricos se convierten con parseFloat y parseInt; aún faltan reglas estrictas para pesos y repeticiones negativos.')

section(5,'Catálogo y contador de calorías')
h('Selector de ejercicios')
p('ExercisePickerModal.tsx filtra el catálogo por nombre o descripción. toLowerCase ignora diferencias de mayúsculas y includes busca coincidencias parciales. No se normalizan las tildes.')
code('catalogoEjercicios.filter((ej) =>\n  ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||\n  ej.detalle.toLowerCase().includes(busqueda.toLowerCase())\n);')
p('FlatList presenta los resultados con ID, imagen, nombre y detalle. Al seleccionar, llama a alSeleccionar(item), cierra y limpia la búsqueda. Las imágenes locales vienen de require y se muestran con expo-image.')
h('Calorías y meta diaria')
p('progreso.tsx administra alimentos, meta diaria, filtro de categoría y dos formularios: registro de alimento y cambio de meta. La meta inicial es 2.000 kcal.')
code('const totalConsumido = alimentos.reduce(\n  (total, item) => total + item.calorias, 0\n);\nconst caloriasRestantes =\n  Math.max(0, metaDiaria - totalConsumido);\nconst porcentajeProgreso = Math.min(\n  100, Math.round((totalConsumido / metaDiaria) * 100)\n);')
p('Los alimentos iniciales suman 1.120 kcal: con la meta de 2.000, quedan 880 y el progreso es 56 %. Si se supera la meta, la barra se vuelve roja; las restantes no bajan de cero y el porcentaje no supera 100.')
p('Filtrar por categoría cambia solo la lista visible. El resumen sigue sumando todos los alimentos. Los cálculos son valores derivados y se recalculan al renderizar; no requieren un estado independiente.')
h('Validación y alcance')
p('Un alimento requiere nombre y calorías mayores que cero. La meta admite al menos 500 según la regla implementada. Registrar y eliminar actualizan el estado; Limpiar día elimina la lista tras confirmar.')
p('Cada alimento almacena una hora HH:MM, pero no una fecha completa. Por tanto, no existe separación automática por día ni historial. Las calorías se ingresan manualmente: no se consultan desde una base nutricional.')

section(6,'Interfaz y configuración técnica')
h('Los componentes que debes reconocer')
table([['Elemento','Función'],['View / Text','Contenedor de interfaz y texto móvil. JSX no equivale a HTML.'],['TextInput','Campo controlado mediante value y onChangeText.'],['TouchableOpacity / Pressable','Acciones táctiles; necesitan handlers para ejecutar lógica.'],['Modal / Alert','Formulario superpuesto y diálogo de aviso o confirmación.'],['ScrollView / FlatList','Contenido desplazable y lista con renderizado por ventana.'],['SafeAreaView','Respeta zonas seguras del dispositivo.'],['KeyboardAvoidingView','Ajusta el contenido frente al teclado según plataforma.']],[170,325])
code('<TextInput\n  value={nombre}\n  onChangeText={setNombre}\n/>\n\n{rutinas.length === 0 && <VistaVacia />}')
p('El campo controlado refleja el estado y lo actualiza al escribir. La expresión con && muestra una vista solo si la condición es verdadera. key identifica elementos de una lista; ?. accede a una propiedad si el objeto existe.')
h('Cómo se conectan los estilos')
p('NativeWind permite className="bg-orange-500 px-4 py-3 rounded-xl". global.css incluye las directivas Tailwind; tailwind.config.js examina src; Babel transforma el código y Metro conecta NativeWind con el CSS. nativewind-env.d.ts añade soporte de tipos.')
h('Los archivos de configuración')
p('<b>app.json:</b> nombre, iconos, orientación, splash, esquema de enlaces y opciones por plataforma. <b>tsconfig.json:</b> comprobación estricta y alias. <b>eslint.config.js:</b> reglas de revisión. <b>package-lock.json:</b> versiones resueltas de dependencias.')
p('El alias @/* apunta a src y @/assets/* apunta a assets de la raíz. node_modules contiene dependencias; .expo contiene datos generados. AGENTS.md establece instrucciones de trabajo; README explica el proyecto y LICENSE define sus condiciones de uso.')

section(7,'Limitaciones, verificación y estudio')
h('Qué funciona y qué queda pendiente')
table([['Implementado','Pendiente'],['CRUD de rutinas y series','Persistencia y recuperación de datos.'],['Catálogo y búsqueda de ejercicios','Sesiones de entrenamiento e historial.'],['Registro, filtros y total de calorías','Separación real por fecha y perfil de usuario.'],['Formulario de meta y estados vacíos','Reordenamiento, explorador y acciones de Perfil.']],[247,248])
p('Las principales mejoras son conservar los datos, reforzar la validación numérica, conectar Inicio con datos reales y completar el seguimiento de entrenamientos. Los ID basados en Date.now son simples y no garantizan unicidad absoluta ante creaciones simultáneas.')
h('Qué verificaciones se hicieron')
p('En la revisión del proyecto se ejecutaron expo lint y tsc --noEmit sin errores. Son comprobaciones estáticas de la aplicación principal; no constituyen una prueba de todas las interacciones en un teléfono.')
code('npx expo start           # Iniciar desarrollo\nnpx expo lint            # Revisar el código\nnpx tsc --noEmit          # Comprobar tipos\nnpx expo install paquete # Instalar versión compatible')
p('La raíz contiene package-lock.json y no bun.lock, por lo que se muestran comandos con npx. El script reset-project apunta a scripts/reset-project.js, que no aparece entre los archivos revisados; conviene comprobarlo antes de usarlo.')
h('Orden recomendado de estudio')
p('1. Modelos de rutinas. 2. Estado y CRUD en Entrenos. 3. Props y cambios anidados en RoutineModal. 4. Búsqueda del catálogo. 5. Cálculos de calorías. 6. Layouts de navegación. 7. Configuración y limitaciones.')
h('Referencias')
p('Fuentes locales: package.json; src/app y sus layouts; src/components; src/store; app.json y configuraciones de la raíz. La guía refleja el código revisado, no funciones futuras.')
for title,url in [('Expo SDK 54','https://docs.expo.dev/versions/v54.0.0/'),('Expo Router para SDK 54','https://docs.expo.dev/versions/v54.0.0/sdk/router/'),('NavigationBar para SDK 54','https://docs.expo.dev/versions/v54.0.0/sdk/navigation-bar/')]:
    story.append(Paragraph(f'<link href="{url}" color="#EA580C">{title}</link>',styles['SmallG']))

questions=[
('¿Cuál es el objetivo de FitPulse?','Organizar rutinas con ejercicios y series, y registrar alimentos para comparar las calorías consumidas con una meta. Los datos actuales se mantienen en memoria.'),
('¿Qué aporta cada tecnología?','React administra componentes y estado; React Native ofrece elementos móviles; Expo facilita el desarrollo; Router organiza rutas; TypeScript comprueba tipos y NativeWind aplica estilos.'),
('¿Qué versión de Expo utiliza?','La aplicación principal declara ~54.0.37. El README menciona SDK 57 y está desactualizado; my-expo-app es independiente y declara SDK 56.'),
('¿Cómo se organiza el código?','app contiene pantallas y navegación, components contiene piezas de interfaz, store contiene modelos y listas iniciales, y assets contiene recursos locales.'),
('¿Cómo funciona la navegación?','expo-router/entry carga el layout raíz con Stack. Dentro, el layout de (tabs) define las cuatro pestañas. El nombre del grupo no forma parte del camino de navegación.'),
('¿Qué diferencia hay entre pantalla y componente?','Una pantalla es una sección navegable como Entrenos. Un componente es una pieza utilizada por una pantalla, como ModalRutina, con su propia responsabilidad.'),
('¿Qué es el estado?','Son datos que cambian mientras se usa un componente. useState entrega el valor y un setter. Actualizarlo provoca un nuevo renderizado para reflejar el cambio.'),
('¿Qué diferencia hay entre estado y props?','El estado lo administra el componente; las props llegan desde su padre. Entrenos pasa al modal la visibilidad, la rutina elegida y callbacks para guardar o cerrar.'),
('¿Cómo se comunica el modal con Entrenos?','Mediante alGuardar(rutinaGuardada). El modal construye el resultado y el padre actualiza la colección. alCerrar comunica que el formulario debe cerrarse.'),
('¿Cómo se modela una rutina?','Una Rutina tiene ejercicios y cada Ejercicio tiene series. Una Serie registra ID, número de serie, peso y repeticiones. Esto permite cargas distintas por ejercicio y serie.'),
('¿Para qué sirven las interfaces?','Describen la estructura de datos y permiten detectar incompatibilidades durante el desarrollo. No validan por sí solas el texto o números ingresados por el usuario.'),
('¿Qué significa CRUD?','Crear, leer, actualizar y eliminar. Entrenos crea rutinas, las muestra, reemplaza sus datos al editar y las quita al eliminar, siempre en el estado local.'),
('¿Cómo distingues creación y edición?','rutinaAEditar es null al crear. Al editar contiene una Rutina, que se precarga en el formulario y conserva su ID al guardar.'),
('¿Para qué usas map, filter y spread?','map transforma o reemplaza elementos; filter conserva los que cumplen una condición; spread copia elementos o propiedades. Se usan para construir el siguiente estado.'),
('¿Qué es la inmutabilidad?','Actualizar creando arreglos y objetos nuevos en vez de alterar directamente los existentes. Para una serie, se reconstruye el ejercicio, su lista de series y la serie modificada.'),
('¿Qué evita que cancelar cambie la rutina?','El modal mantiene un borrador y copia los ejercicios al editar. Solo comunica el resultado al guardar. La copia por JSON es válida para estos datos simples, pero tiene limitaciones.'),
('¿Cómo funciona la búsqueda?','Filtra el catálogo por coincidencias en nombre o descripción mediante includes y toLowerCase. Ignora mayúsculas, pero no normaliza las tildes.'),
('¿Por qué utilizar FlatList?','Mantiene una ventana de elementos renderizados, útil al crecer el catálogo. ScrollView con map genera todos los elementos; la elección depende del tamaño y de la implementación.'),
('¿Cómo se calculan las calorías?','reduce suma las kcal; la meta menos el total da las restantes; total dividido por meta y multiplicado por cien da el porcentaje. Se limitan restantes a cero y porcentaje a cien.'),
('¿El filtro cambia el total?','No. Cambia la lista visible, pero el cálculo del resumen utiliza todos los alimentos. Es una separación entre los datos originales y su presentación filtrada.'),
('¿Qué validaciones implementaste?','Nombre y al menos un ejercicio por rutina; al menos una serie por ejercicio; nombre y calorías positivas por alimento. Falta reforzar la validación de pesos y repeticiones.'),
('¿El teclado numérico garantiza números válidos?','No. Facilita la entrada, pero la lógica debe validar el valor y sus límites. parseInt puede aceptar parcialmente texto como 100abc y no sustituye una validación estricta.'),
('¿Cómo consideras Android e iOS?','Platform.OS ajusta el comportamiento del teclado y el espaciado de pestañas. SafeAreaView protege el contenido de zonas del dispositivo. Debe comprobarse en ambas plataformas.'),
('¿Qué hace useEffect en el layout?','Solicita ocultar la barra de navegación del sistema en Android después de montar el componente. El efecto tiene dependencias vacías y no depende del estado cambiante de la pantalla.'),
('¿Se conservan los datos al reiniciar?','No. useState es temporal. Sería necesario implementar almacenamiento persistente y recuperar las rutinas, alimentos y preferencias al iniciar la aplicación.'),
('¿La carpeta store es una base de datos?','No. Define interfaces, catálogo y datos iniciales. No implementa Redux, Zustand ni un estado global compartido; cada pantalla administra su estado local.'),
('¿Qué funciones están incompletas?','Inicio y Perfil usan datos de ejemplo. Empezar entrenamiento y Explorar muestran avisos; no hay sesión real, reordenamiento ni acciones de las opciones del perfil.'),
('¿El registro distingue cada día?','No automáticamente. Guarda hora, pero no fecha completa. Para un historial habría que registrar fechas y agrupar o filtrar los alimentos por día.'),
('¿Qué mejorarías y cómo lo probarías?','Priorizaría persistencia, validación y sesiones reales. Probaría crear, editar, cancelar y eliminar rutinas, gestionar series y registrar, filtrar y eliminar alimentos en dispositivos.'),
('¿Cuál es el código más importante?','RoutineModal, porque combina props, estado del borrador, callbacks y actualizaciones inmutables anidadas. También son centrales el CRUD de Entrenos y los cálculos derivados de Calorías.')]
for block in range(3):
    section(8+block, ['Defensa oral: fundamentos','Defensa oral: lógica y datos','Defensa oral: límites y mejoras'][block])
    p('Respuestas modelo. Adáptalas a tus palabras y acompáñalas con un ejemplo concreto del proyecto.')
    for i,(q,a) in enumerate(questions[block*10:(block+1)*10],start=block*10+1): qa(i,q,a)

def footer(c,doc):
    w,h=A4
    c.setStrokeColor(ORANGE); c.setLineWidth(2); c.line(48,h-34,w-48,h-34)
    c.setFont('Guide',8); c.setFillColor(GREY)
    c.drawString(48,28,'FitPulse | Guía de estudio y defensa oral')
    c.drawRightString(w-48,28,str(doc.page))
doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=50,leftMargin=50,topMargin=53,bottomMargin=48,title='FitPulse - Guía de estudio y defensa oral',author='Guía técnica del proyecto FitPulse')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(str(OUT))
print(f'PDF: {OUT}\nPáginas: {len(reader.pages)}')
for n,page in enumerate(reader.pages,1):
    txt=page.extract_text() or ''
    print(f'{n}: {len(txt)} caracteres | {txt[:90].replace(chr(10), " ")}')
