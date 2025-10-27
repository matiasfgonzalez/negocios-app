"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Store,
  ShoppingCart,
  MapPin,
  Smartphone,
  TrendingUp,
  Shield,
  Clock,
  Heart,
  Users,
  Package,
  CreditCard,
  Truck,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-accent transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-medium border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Conectando tu barrio</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
            Bienvenido a{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              BarrioMarket
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            La plataforma que une a los comercios de tu barrio con vos.
            Descubrí, comprá y apoyá a los negocios locales desde la comodidad
            de tu casa.
          </p>
        </div>

        {/* ¿Qué es BarrioMarket? */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/0 to-secondary/5 dark:from-primary/10 dark:via-primary/0 dark:to-secondary/10 border-border">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl flex items-center gap-3">
                <Store className="w-8 h-8 text-primary" />
                ¿Qué es BarrioMarket?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-base sm:text-lg leading-relaxed">
                <span className="font-semibold text-foreground">
                  BarrioMarket
                </span>{" "}
                es una plataforma digital argentina que revoluciona la forma en
                que comprás y vendés en tu comunidad. Conectamos a comerciantes
                locales con clientes de manera simple, rápida y segura.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Ya seas dueño de un almacén, una verdulería, una panadería o
                cualquier comercio local, o simplemente un vecino que quiere
                apoyar a los negocios del barrio,{" "}
                <span className="font-semibold text-foreground">
                  BarrioMarket
                </span>{" "}
                es tu solución.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Para Clientes */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              Para Clientes
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprá fácil, rápido y desde tu casa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MapPin className="w-6 h-6" />}
              title="Encontrá negocios cerca tuyo"
              description="Descubrí comercios locales en tu zona con nuestro mapa interactivo. Filtrá por rubro y encontrá exactamente lo que necesitás."
              gradient="from-blue-500 to-cyan-500"
            />

            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Catálogo completo"
              description="Navegá por los productos de cada negocio, con fotos, descripciones y precios actualizados en tiempo real."
              gradient="from-purple-500 to-pink-500"
            />

            <FeatureCard
              icon={<ShoppingCart className="w-6 h-6" />}
              title="Pedidos simples"
              description="Armá tu carrito, elegí si querés envío a domicilio y confirmá tu pedido en segundos. Todo desde tu celular."
              gradient="from-orange-500 to-red-500"
            />

            <FeatureCard
              icon={<CreditCard className="w-6 h-6" />}
              title="Múltiples formas de pago"
              description="Pagá con transferencia, MercadoPago, efectivo o como prefieras. Cada negocio acepta diferentes métodos."
              gradient="from-green-500 to-emerald-500"
            />

            <FeatureCard
              icon={<Truck className="w-6 h-6" />}
              title="Seguí tu pedido"
              description="Recibí notificaciones del estado de tu pedido: desde que lo preparan hasta que llega a tu puerta."
              gradient="from-indigo-500 to-blue-500"
            />

            <FeatureCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="Contacto directo"
              description="Hablá por WhatsApp con el comercio para coordinar detalles o hacer consultas sobre tus productos."
              gradient="from-teal-500 to-green-500"
            />
          </div>
        </section>

        {/* Para Propietarios */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Para Propietarios
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Llevá tu negocio al siguiente nivel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Smartphone className="w-6 h-6" />}
              title="Tu negocio online"
              description="Creá tu tienda digital en minutos. Sin conocimientos técnicos. 100% gratis para empezar."
              gradient="from-violet-500 to-purple-500"
            />

            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Gestión de productos"
              description="Subí fotos, precios y stock de tus productos. Actualizá todo desde tu celular cuando quieras."
              gradient="from-pink-500 to-rose-500"
            />

            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Nuevos clientes"
              description="Llegá a más personas de tu zona. Aparecé en las búsquedas y en el mapa para que te descubran."
              gradient="from-amber-500 to-orange-500"
            />

            <FeatureCard
              icon={<ShoppingCart className="w-6 h-6" />}
              title="Pedidos organizados"
              description="Recibí todos tus pedidos en un solo lugar. Gestioná estados, envíos y pagos fácilmente."
              gradient="from-lime-500 to-green-500"
            />

            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Estadísticas y reportes"
              description="Mirá cómo crece tu negocio con reportes de ventas, productos más vendidos y análisis de clientes."
              gradient="from-cyan-500 to-blue-500"
            />

            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Ahorrá tiempo"
              description="Automatizá la toma de pedidos. Dedicá más tiempo a preparar y menos a gestionar."
              gradient="from-fuchsia-500 to-pink-500"
            />
          </div>
        </section>

        {/* Ventajas de BarrioMarket */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Por qué elegir BarrioMarket?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Somos más que una plataforma, somos tu aliado en el barrio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BenefitCard
              icon={<Heart className="w-6 h-6 text-red-500" />}
              title="Apoyo local"
              description="Cada compra que hacés fortalece la economía de tu barrio. Ayudás a que los comercios locales crezcan y se mantengan."
            />

            <BenefitCard
              icon={<Shield className="w-6 h-6 text-blue-500" />}
              title="Seguro y confiable"
              description="Todos los negocios son verificados. Tus datos están protegidos y tus transacciones son seguras."
            />

            <BenefitCard
              icon={<Smartphone className="w-6 h-6 text-purple-500" />}
              title="Fácil de usar"
              description="Diseñado para que cualquiera pueda usarlo. Sin complicaciones, sin trámites innecesarios."
            />

            <BenefitCard
              icon={<MapPin className="w-6 h-6 text-green-500" />}
              title="Cerca de vos"
              description="Todos los comercios están en tu zona. Comprás local, recibís rápido y conocés a tus vecinos."
            />
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Es muy simple, seguí estos pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Para Clientes */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                  Como Cliente
                </CardTitle>
                <CardDescription>Comprá en 4 simples pasos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <StepItem
                    number={1}
                    title="Registrate gratis"
                    description="Creá tu cuenta en segundos con tu email o Google."
                  />
                  <StepItem
                    number={2}
                    title="Buscá y explorá"
                    description="Encontrá el negocio que necesitás usando el buscador o el mapa."
                  />
                  <StepItem
                    number={3}
                    title="Armá tu pedido"
                    description="Elegí productos, agregá al carrito y confirmá tu orden."
                  />
                  <StepItem
                    number={4}
                    title="Recibí o retirá"
                    description="Esperá tu pedido en casa o retiralo en el local."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Para Propietarios */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-primary" />
                  Como Propietario
                </CardTitle>
                <CardDescription>Vendé en 4 simples pasos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <StepItem
                    number={1}
                    title="Registrá tu negocio"
                    description="Completá los datos básicos: nombre, dirección, rubro y contacto."
                  />
                  <StepItem
                    number={2}
                    title="Cargá tus productos"
                    description="Subí fotos, precios y stock de lo que vendés."
                  />
                  <StepItem
                    number={3}
                    title="Recibí pedidos"
                    description="Los clientes te encontrarán y harán sus pedidos online."
                  />
                  <StepItem
                    number={4}
                    title="Gestioná y entregá"
                    description="Prepará el pedido, confirmá el pago y enviá o entregá."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Estadísticas */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-border">
            <CardContent className="py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatItem number="100%" label="Gratis para empezar" />
                <StatItem number="24/7" label="Disponible" />
                <StatItem number="∞" label="Productos" />
                <StatItem number="💚" label="Tu barrio" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Características técnicas */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Características destacadas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tecnología de punta al servicio de tu comunidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TechFeature
              icon={<MapPin className="w-6 h-6" />}
              title="Mapa interactivo"
              description="Visualizá todos los negocios en un mapa en tiempo real con su ubicación exacta."
            />
            <TechFeature
              icon={<Smartphone className="w-6 h-6" />}
              title="100% Responsive"
              description="Usá la plataforma desde cualquier dispositivo: celular, tablet o computadora."
            />
            <TechFeature
              icon={<MessageCircle className="w-6 h-6" />}
              title="WhatsApp integrado"
              description="Contactá directamente con el comercio por WhatsApp con un solo clic."
            />
            <TechFeature
              icon={<Package className="w-6 h-6" />}
              title="Gestión de stock"
              description="Control automático de inventario para que nunca vendas productos sin stock."
            />
            <TechFeature
              icon={<TrendingUp className="w-6 h-6" />}
              title="Dashboard completo"
              description="Panel de control con estadísticas, reportes y análisis de ventas."
            />
            <TechFeature
              icon={<Shield className="w-6 h-6" />}
              title="Seguridad garantizada"
              description="Autenticación segura y protección de datos con las mejores prácticas."
            />
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground border-0 shadow-2xl">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Unite a BarrioMarket hoy y formá parte de la comunidad que está
                transformando el comercio local en Argentina
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Registrarme como Cliente
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Store className="w-5 h-5 mr-2" />
                    Registrar mi Negocio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <CardHeader>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
        {number}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TechFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
