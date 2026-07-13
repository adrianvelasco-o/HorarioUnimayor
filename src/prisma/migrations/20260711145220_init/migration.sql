-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombreRol" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "administrador" (
    "id_administrador" INTEGER NOT NULL,
    "telefono" VARCHAR(20),

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateTable
CREATE TABLE "docente" (
    "id_docente" INTEGER NOT NULL,
    "identificacion" VARCHAR(50) NOT NULL,
    "telefono" VARCHAR(20),
    "horas_semanales_maximas" INTEGER NOT NULL,
    "tipo_contrato" VARCHAR(50) NOT NULL,

    CONSTRAINT "docente_pkey" PRIMARY KEY ("id_docente")
);

-- CreateTable
CREATE TABLE "periodo_academico" (
    "id_periodo" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "periodo_academico_pkey" PRIMARY KEY ("id_periodo")
);

-- CreateTable
CREATE TABLE "salon" (
    "id_salon" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "ubicacion" VARCHAR(150),

    CONSTRAINT "salon_pkey" PRIMARY KEY ("id_salon")
);

-- CreateTable
CREATE TABLE "labor" (
    "id_labor" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" VARCHAR(255),
    "horas_semanales" INTEGER NOT NULL,

    CONSTRAINT "labor_pkey" PRIMARY KEY ("id_labor")
);

-- CreateTable
CREATE TABLE "materia" (
    "id_materia" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "creditos" INTEGER NOT NULL,
    "horas_semanales" INTEGER NOT NULL,

    CONSTRAINT "materia_pkey" PRIMARY KEY ("id_materia")
);

-- CreateTable
CREATE TABLE "horario" (
    "id_horario" SERIAL NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_salon" INTEGER NOT NULL,
    "id_labor" INTEGER,
    "id_materia" INTEGER,
    "dia_semana" VARCHAR(15) NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,

    CONSTRAINT "horario_pkey" PRIMARY KEY ("id_horario")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombreRol_key" ON "rol"("nombreRol");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "docente_identificacion_key" ON "docente"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "periodo_academico_nombre_key" ON "periodo_academico"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "salon_nombre_key" ON "salon"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "labor_nombre_key" ON "labor"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "materia_codigo_key" ON "materia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "materia_nombre_key" ON "materia"("nombre");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_id_administrador_fkey" FOREIGN KEY ("id_administrador") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente" ADD CONSTRAINT "docente_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodo_academico"("id_periodo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_salon_fkey" FOREIGN KEY ("id_salon") REFERENCES "salon"("id_salon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_labor_fkey" FOREIGN KEY ("id_labor") REFERENCES "labor"("id_labor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_materia_fkey" FOREIGN KEY ("id_materia") REFERENCES "materia"("id_materia") ON DELETE RESTRICT ON UPDATE CASCADE;
