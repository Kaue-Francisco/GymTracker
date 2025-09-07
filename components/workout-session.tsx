"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit3, Save, X, Weight, ImageIcon } from "lucide-react"
import type { Exercise } from "@/app/page"

interface WorkoutSessionProps {
  exercises: Exercise[]
  onUpdateExercise: (exerciseId: string, updates: Partial<Exercise>) => void
  onRemoveExercise: (exerciseId: string) => void
  sessionName: string
}

export function WorkoutSession({ exercises, onUpdateExercise, onRemoveExercise, sessionName }: WorkoutSessionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Exercise>>({})

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setEditForm({ ...editForm, image: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const startEditing = (exercise: Exercise) => {
    setEditingId(exercise.id)
    setEditForm(exercise)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEditing = () => {
    if (editingId && editForm) {
      onUpdateExercise(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <Weight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum exercício em {sessionName}</h3>
        <p className="text-muted-foreground">Adicione seu primeiro exercício para começar o treino!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <Card key={exercise.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              {editingId === exercise.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome do exercício"
                    className="font-semibold"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {exercise.image && (
                    <img
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                  )}
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                </div>
              )}

              <div className="flex items-center gap-2">
                {editingId === exercise.id ? (
                  <>
                    <Button size="sm" onClick={saveEditing} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => startEditing(exercise)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onRemoveExercise(exercise.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {editingId === exercise.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`image-${exercise.id}`}>Imagem do Exercício</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`image-${exercise.id}`}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {editForm.image && (
                    <div className="mt-2">
                      <img
                        src={editForm.image || "/placeholder.svg"}
                        alt="Preview do exercício"
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`sets-${exercise.id}`}>Séries</Label>
                  <Input
                    id={`sets-${exercise.id}`}
                    type="number"
                    min="1"
                    value={editForm.sets || ""}
                    onChange={(e) => setEditForm({ ...editForm, sets: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Número de séries"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`weight-${exercise.id}`}>Carga (kg)</Label>
                  <Input
                    id={`weight-${exercise.id}`}
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm.weight || ""}
                    onChange={(e) => setEditForm({ ...editForm, weight: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Peso em kg"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`notes-${exercise.id}`}>Observações</Label>
                  <Textarea
                    id={`notes-${exercise.id}`}
                    value={editForm.notes || ""}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Observações sobre o exercício..."
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {exercise.image && (
                  <div className="flex justify-center">
                    <img
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {exercise.sets} {exercise.sets === 1 ? "série" : "séries"}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {exercise.weight}kg
                  </Badge>
                </div>

                {exercise.notes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
