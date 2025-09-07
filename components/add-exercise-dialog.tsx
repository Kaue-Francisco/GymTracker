"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// Added ImageIcon for the upload button
import { ImageIcon } from "lucide-react"
import type { Exercise } from "@/app/page"

interface AddExerciseDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddExercise: (exercise: Omit<Exercise, "id">) => void
  sessionName: string
}

export function AddExerciseDialog({ isOpen, onClose, onAddExercise, sessionName }: AddExerciseDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    sets: 1,
    weight: 0,
    notes: "",
    image: "",
  })

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
        setFormData({ ...formData, image: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    onAddExercise({
      name: formData.name.trim(),
      sets: formData.sets,
      weight: formData.weight,
      notes: formData.notes.trim(),
      image: formData.image || undefined,
    })

    // Reset form
    setFormData({
      name: "",
      sets: 1,
      weight: 0,
      notes: "",
      image: "",
    })

    onClose()
  }

  const handleClose = () => {
    setFormData({
      name: "",
      sets: 1,
      weight: 0,
      notes: "",
      image: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Exercício</DialogTitle>
          <DialogDescription>Adicione um novo exercício para a sessão de {sessionName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Nome do Exercício *</Label>
            <Input
              id="exercise-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Supino reto, Agachamento..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-image">Imagem do Exercício</Label>
            <div className="flex items-center gap-2">
              <Input id="exercise-image" type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Preview do exercício"
                  className="w-20 h-20 object-cover rounded-md border"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">Máximo 2MB. Formatos: JPG, PNG, GIF</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-sets">Séries</Label>
              <Input
                id="exercise-sets"
                type="number"
                min="1"
                max="20"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: Number.parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise-weight">Carga (kg)</Label>
              <Input
                id="exercise-weight"
                type="number"
                min="0"
                step="0.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-notes">Observações</Label>
            <Textarea
              id="exercise-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre técnica, descanso, etc..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Adicionar Exercício
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
