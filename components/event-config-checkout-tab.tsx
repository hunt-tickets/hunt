"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, GripVertical, ShoppingCart } from "lucide-react";

interface CheckoutQuestion {
  id: string;
  question: string;
  type: "text" | "email" | "select" | "textarea";
  required: boolean;
  scope: "per_order" | "per_ticket";
  ticket_type_ids: string[];
  options: string[];
  placeholder: string;
  sort_order: number;
}

interface EventConfigCheckoutTabProps {
  checkoutQuestions: CheckoutQuestion[];
  isAddingQuestion: boolean;
  editingQuestion: CheckoutQuestion | null;
  draggedQuestionIndex: number | null;
  dragOverQuestionIndex: number | null;
  setIsAddingQuestion: (value: boolean) => void;
  setEditingQuestion: (question: CheckoutQuestion | null) => void;
  handleQuestionDragStart: (e: React.DragEvent, index: number) => void;
  handleQuestionDragOver: (e: React.DragEvent, index: number) => void;
  handleQuestionDragLeave: () => void;
  handleQuestionDrop: (e: React.DragEvent, index: number) => void;
  handleQuestionDragEnd: () => void;
  deleteCheckoutQuestion: (id: string) => void;
}

export function EventConfigCheckoutTab({
  checkoutQuestions,
  isAddingQuestion,
  editingQuestion,
  draggedQuestionIndex,
  dragOverQuestionIndex,
  setIsAddingQuestion,
  setEditingQuestion,
  handleQuestionDragStart,
  handleQuestionDragOver,
  handleQuestionDragLeave,
  handleQuestionDrop,
  handleQuestionDragEnd,
  deleteCheckoutQuestion,
}: EventConfigCheckoutTabProps) {
  return (
    <div className="space-y-4">
      <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Preguntas de Checkout</CardTitle>
              <CardDescription className="mt-1.5 text-gray-500 dark:text-gray-400">
                Configura preguntas personalizadas para el proceso de compra
              </CardDescription>
            </div>
            {!isAddingQuestion && !editingQuestion && (
              <Button
                onClick={() => {
                  setIsAddingQuestion(true);
                  setEditingQuestion(null);
                }}
                className="rounded-lg shrink-0 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Pregunta
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add/Edit Form - Will be implemented */}
          {(isAddingQuestion || editingQuestion) && (
            <div className="p-6 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white/80 uppercase tracking-wider">
                  {editingQuestion ? "Editar Pregunta" : "Nueva Pregunta"}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Pregunta <span className="text-gray-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ej. ¿Cuál es tu nombre completo?"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                  />
                </div>

                {/* Type Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Tipo de respuesta <span className="text-gray-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Texto corto</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Una línea de texto</div>
                    </button>
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Email</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Dirección de correo</div>
                    </button>
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Selección</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Opciones múltiples</div>
                    </button>
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Texto largo</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Párrafo completo</div>
                    </button>
                  </div>
                </div>

                {/* Placeholder */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Texto de ayuda (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Ingresa tu nombre tal como aparece en tu documento"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                  />
                </div>

                {/* Scope Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Alcance <span className="text-gray-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-900 dark:border-white bg-gray-50 dark:bg-[#252525] transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Por orden</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Se pregunta una vez</div>
                    </button>
                    <button
                      type="button"
                      className="p-3 rounded-xl border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#202020] hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Por ticket</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Por cada entrada</div>
                    </button>
                  </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2a2a2a]">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Respuesta obligatoria</div>
                    <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                      Los usuarios deben responder esta pregunta
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-900 dark:bg-white transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition translate-x-6" />
                    </button>
                  </div>
                </div>

                {/* Ticket Types (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Tipos de entrada específicos (opcional)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-white/40">
                    Deja vacío para aplicar a todos los tipos de entrada
                  </p>
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-[#2a2a2a]" />
                        <span className="text-sm text-gray-900 dark:text-white">General</span>
                      </label>
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-[#2a2a2a]" />
                        <span className="text-sm text-gray-900 dark:text-white">VIP</span>
                      </label>
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 dark:border-[#2a2a2a]" />
                        <span className="text-sm text-gray-900 dark:text-white">Palco</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setEditingQuestion(null);
                  }}
                  className="rounded-lg border-gray-300 dark:border-[#2a2a2a]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Save logic will be implemented
                    setIsAddingQuestion(false);
                    setEditingQuestion(null);
                  }}
                  className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90"
                >
                  {editingQuestion ? "Guardar Cambios" : "Crear Pregunta"}
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {checkoutQuestions.length === 0 && !isAddingQuestion && !editingQuestion && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No hay preguntas de checkout
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/40 mb-4">
                Comienza agregando tu primera pregunta personalizada
              </p>
            </div>
          )}

          {/* Questions List */}
          {checkoutQuestions.length > 0 && !isAddingQuestion && !editingQuestion && (
            <div className="space-y-3">
              {checkoutQuestions.map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={(e) => handleQuestionDragStart(e, index)}
                  onDragOver={(e) => handleQuestionDragOver(e, index)}
                  onDragLeave={handleQuestionDragLeave}
                  onDrop={(e) => handleQuestionDrop(e, index)}
                  onDragEnd={handleQuestionDragEnd}
                  className={`group relative p-4 rounded-xl border transition-all cursor-move ${
                    draggedQuestionIndex === index
                      ? "opacity-50 scale-95"
                      : dragOverQuestionIndex === index
                      ? "border-gray-400 dark:border-gray-400 bg-gray-100 dark:bg-[#2a2a2a]"
                      : "border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-[#3a3a3a]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <GripVertical className="h-5 w-5 text-gray-400 dark:text-white/40 mt-0.5 flex-shrink-0" />

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {question.question}
                          {question.required && (
                            <span className="text-gray-400 ml-1">*</span>
                          )}
                        </h4>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {/* Type Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70">
                          {question.type === "text" && "Texto"}
                          {question.type === "email" && "Email"}
                          {question.type === "select" && "Selección"}
                          {question.type === "textarea" && "Texto largo"}
                        </span>

                        {/* Scope Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70">
                          {question.scope === "per_order" ? "Por orden" : "Por ticket"}
                        </span>

                        {/* Ticket Types Badge (if specific) */}
                        {question.ticket_type_ids.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70">
                            Específica ({question.ticket_type_ids.length} tipos)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(question)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600 dark:text-white/60" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCheckoutQuestion(question.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
