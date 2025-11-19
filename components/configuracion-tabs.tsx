"use client";

import { useState } from "react";
import { Settings, Shield, CreditCard, Bell, HelpCircle, Plus, Trash2, Edit2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HoverButton } from "@/components/ui/hover-glow-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function ConfiguracionTabs() {
  const [activeTab, setActiveTab] = useState<"general" | "pagos" | "seguridad" | "notificaciones" | "faqs">("general");
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: "1",
      question: "¿Cómo puedo comprar tickets?",
      answer: "Puedes comprar tickets directamente desde nuestra plataforma seleccionando el evento de tu interés y siguiendo el proceso de compra."
    },
    {
      id: "2",
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito, débito y pagos en efectivo en puntos autorizados."
    }
  ]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === "general"
              ? "bg-white/10 text-white border border-white/20"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <Settings className="h-4 w-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab("pagos")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === "pagos"
              ? "bg-white/10 text-white border border-white/20"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Pagos
        </button>
        <button
          onClick={() => setActiveTab("seguridad")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === "seguridad"
              ? "bg-white/10 text-white border border-white/20"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <Shield className="h-4 w-4" />
          Seguridad
        </button>
        <button
          onClick={() => setActiveTab("notificaciones")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === "notificaciones"
              ? "bg-white/10 text-white border border-white/20"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notificaciones
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === "faqs"
              ? "bg-white/10 text-white border border-white/20"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          FAQs
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Ajustes principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Modo Mantenimiento</Label>
                  <p className="text-sm text-white/40">
                    Deshabilita el acceso público al sitio
                  </p>
                </div>
                <Switch id="maintenance" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration">Registro de Usuarios</Label>
                  <p className="text-sm text-white/40">
                    Permite que nuevos usuarios se registren
                  </p>
                </div>
                <Switch id="registration" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="events">Creación de Eventos</Label>
                  <p className="text-sm text-white/40">
                    Permite que productores creen nuevos eventos
                  </p>
                </div>
                <Switch id="events" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <HoverButton
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              glowColor="#000000"
              backgroundColor="transparent"
              textColor="inherit"
              hoverTextColor="inherit"
            >
              Guardar Cambios
            </HoverButton>
          </div>
        </div>
      )}

      {activeTab === "pagos" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle>Configuración de Pagos</CardTitle>
              <CardDescription>
                Métodos de pago y comisiones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comisión Plataforma</Label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-sm"
                    placeholder="10"
                    defaultValue="10"
                  />
                  <p className="text-xs text-white/40">Porcentaje de comisión</p>
                </div>
                <div className="space-y-2">
                  <Label>Comisión Variable</Label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-sm"
                    placeholder="2.5"
                    defaultValue="2.5"
                  />
                  <p className="text-xs text-white/40">Comisión adicional %</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stripe">Pagos con Tarjeta</Label>
                  <p className="text-sm text-white/40">
                    Habilitar pagos con tarjeta de crédito/débito
                  </p>
                </div>
                <Switch id="stripe" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cash">Pagos en Efectivo</Label>
                  <p className="text-sm text-white/40">
                    Permitir reservas con pago en efectivo
                  </p>
                </div>
                <Switch id="cash" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <HoverButton
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              glowColor="#000000"
              backgroundColor="transparent"
              textColor="inherit"
              hoverTextColor="inherit"
            >
              Guardar Cambios
            </HoverButton>
          </div>
        </div>
      )}

      {activeTab === "seguridad" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Configuración de seguridad y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Autenticación de 2 Factores</Label>
                  <p className="text-sm text-white/40">
                    Requerir 2FA para administradores
                  </p>
                </div>
                <Switch id="2fa" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session">Duración de Sesión</Label>
                  <p className="text-sm text-white/40">
                    Tiempo máximo de sesión activa
                  </p>
                </div>
                <select className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm">
                  <option>30 minutos</option>
                  <option>1 hora</option>
                  <option>2 horas</option>
                  <option>1 día</option>
                  <option>1 semana</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <HoverButton
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              glowColor="#000000"
              backgroundColor="transparent"
              textColor="inherit"
              hoverTextColor="inherit"
            >
              Guardar Cambios
            </HoverButton>
          </div>
        </div>
      )}

      {activeTab === "notificaciones" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configuración de emails y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-new-user">Nuevo Usuario</Label>
                  <p className="text-sm text-white/40">
                    Notificar cuando se registre un nuevo usuario
                  </p>
                </div>
                <Switch id="email-new-user" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-new-event">Nuevo Evento</Label>
                  <p className="text-sm text-white/40">
                    Notificar cuando se cree un nuevo evento
                  </p>
                </div>
                <Switch id="email-new-event" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-purchase">Nueva Compra</Label>
                  <p className="text-sm text-white/40">
                    Notificar cada venta de tickets
                  </p>
                </div>
                <Switch id="email-purchase" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <HoverButton
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              glowColor="#000000"
              backgroundColor="transparent"
              textColor="inherit"
              hoverTextColor="inherit"
            >
              Guardar Cambios
            </HoverButton>
          </div>
        </div>
      )}

      {activeTab === "faqs" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preguntas Frecuentes (FAQs)</CardTitle>
                  <CardDescription>
                    Gestiona las preguntas frecuentes del sistema
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setIsAddingFaq(true);
                    setEditingFaq(null);
                    setNewQuestion("");
                    setNewAnswer("");
                  }}
                  className="rounded-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add/Edit Form */}
              {(isAddingFaq || editingFaq) && (
                <div className="p-4 rounded-lg bg-white/[0.05] border border-white/10 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Pregunta</Label>
                    <Input
                      id="question"
                      value={editingFaq ? editingFaq.question : newQuestion}
                      onChange={(e) => {
                        if (editingFaq) {
                          setEditingFaq({ ...editingFaq, question: e.target.value });
                        } else {
                          setNewQuestion(e.target.value);
                        }
                      }}
                      placeholder="¿Cómo puedo...?"
                      className="rounded-lg bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Respuesta</Label>
                    <Textarea
                      id="answer"
                      value={editingFaq ? editingFaq.answer : newAnswer}
                      onChange={(e) => {
                        if (editingFaq) {
                          setEditingFaq({ ...editingFaq, answer: e.target.value });
                        } else {
                          setNewAnswer(e.target.value);
                        }
                      }}
                      placeholder="La respuesta a esta pregunta es..."
                      className="rounded-lg bg-white/5 border-white/10 min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingFaq(false);
                        setEditingFaq(null);
                        setNewQuestion("");
                        setNewAnswer("");
                      }}
                      className="rounded-lg"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingFaq) {
                          setFaqs(faqs.map(faq => faq.id === editingFaq.id ? editingFaq : faq));
                          setEditingFaq(null);
                        } else {
                          if (newQuestion.trim() && newAnswer.trim()) {
                            setFaqs([...faqs, {
                              id: Date.now().toString(),
                              question: newQuestion,
                              answer: newAnswer
                            }]);
                            setNewQuestion("");
                            setNewAnswer("");
                            setIsAddingFaq(false);
                          }
                        }
                      }}
                      className="rounded-lg"
                      disabled={editingFaq ? !editingFaq.question.trim() || !editingFaq.answer.trim() : !newQuestion.trim() || !newAnswer.trim()}
                    >
                      {editingFaq ? "Actualizar" : "Agregar"}
                    </Button>
                  </div>
                </div>
              )}

              {/* FAQs List */}
              {faqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1 text-white">
                    No hay preguntas frecuentes
                  </h3>
                  <p className="text-sm text-white/40">
                    Agrega preguntas frecuentes para ayudar a tus usuarios
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-white">{faq.question}</h4>
                          <p className="text-sm text-white/60 leading-relaxed">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFaq(faq);
                              setIsAddingFaq(false);
                            }}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("¿Estás seguro de eliminar esta pregunta?")) {
                                setFaqs(faqs.filter(f => f.id !== faq.id));
                              }
                            }}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <HoverButton
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              glowColor="#000000"
              backgroundColor="transparent"
              textColor="inherit"
              hoverTextColor="inherit"
            >
              Guardar Cambios
            </HoverButton>
          </div>
        </div>
      )}
    </div>
  );
}
