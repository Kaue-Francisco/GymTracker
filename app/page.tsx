"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Dumbbell, Target, TrendingUp, Download, Upload } from "lucide-react"
import { WorkoutSession } from "@/components/workout-session"
import { AddExerciseDialog } from "@/components/add-exercise-dialog"

export interface Exercise {
  id: string
  name: string
  sets: number
  weight: number
  notes?: string
  image?: string
}

export interface WorkoutData {
  peito: Exercise[]
  costas: Exercise[]
  perna: Exercise[]
}

const STORAGE_KEY = "gym-workout-data"

export default function GymTracker() {
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    peito: [],
    costas: [],
    perna: [],
  })
  const [activeTab, setActiveTab] = useState<keyof WorkoutData>("peito")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setWorkoutData(parsedData)
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error)
      }
    }
    setIsDataLoaded(true)
  }, [])

  // Save data to localStorage whenever workoutData changes
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutData))
    }
  }, [workoutData, isDataLoaded])

  const addExercise = (exercise: Omit<Exercise, "id">) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
    }

    setWorkoutData((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newExercise],
    }))
  }

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    setWorkoutData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...updates } : exercise,
      ),
    }))
  }

  const removeExercise = (exerciseId: string) => {
    setWorkoutData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((exercise) => exercise.id !== exerciseId),
    }))
  }

  const getTotalExercises = () => {
    return Object.values(workoutData).reduce((total, exercises) => total + exercises.length, 0)
  }

  const getTabLabel = (tab: keyof WorkoutData) => {
    const labels = {
      peito: "Peito",
      costas: "Costas",
      perna: "Perna",
    }
    return labels[tab]
  }

  const exportData = () => {
    const dataToExport = {
      workoutData,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `gym-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        // Validar se os dados têm a estrutura correta
        if (
          importedData.workoutData &&
          typeof importedData.workoutData === "object" &&
          "peito" in importedData.workoutData &&
          "costas" in importedData.workoutData &&
          "perna" in importedData.workoutData
        ) {
          setWorkoutData(importedData.workoutData)
          alert("Dados importados com sucesso!")
        } else {
          alert("Arquivo inválido. Certifique-se de que é um backup válido do Gym Tracker.")
        }
      } catch (error) {
        alert("Erro ao ler o arquivo. Certifique-se de que é um arquivo JSON válido.")
      }
    }
    reader.readAsText(file)

    // Limpar o input para permitir reimportar o mesmo arquivo
    event.target.value = ""
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            Gym Tracker
          </h1>
          <p className="text-muted-foreground">Controle seus treinos de academia de forma simples e eficiente</p>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={exportData} className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar Dados
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent" asChild>
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Importar Dados
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getTotalExercises()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessão Ativa</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getTabLabel(activeTab)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exercícios na Sessão</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{workoutData[activeTab].length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sessões de Treino</CardTitle>
                <CardDescription>Gerencie seus exercícios por grupo muscular</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Exercício
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof WorkoutData)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="peito" className="flex items-center gap-2">
                  Peito
                  {workoutData.peito.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {workoutData.peito.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="costas" className="flex items-center gap-2">
                  Costas
                  {workoutData.costas.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {workoutData.costas.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="perna" className="flex items-center gap-2">
                  Perna
                  {workoutData.perna.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {workoutData.perna.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="peito" className="mt-6">
                <WorkoutSession
                  exercises={workoutData.peito}
                  onUpdateExercise={updateExercise}
                  onRemoveExercise={removeExercise}
                  sessionName="Peito"
                />
              </TabsContent>

              <TabsContent value="costas" className="mt-6">
                <WorkoutSession
                  exercises={workoutData.costas}
                  onUpdateExercise={updateExercise}
                  onRemoveExercise={removeExercise}
                  sessionName="Costas"
                />
              </TabsContent>

              <TabsContent value="perna" className="mt-6">
                <WorkoutSession
                  exercises={workoutData.perna}
                  onUpdateExercise={updateExercise}
                  onRemoveExercise={removeExercise}
                  sessionName="Perna"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AddExerciseDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAddExercise={addExercise}
          sessionName={getTabLabel(activeTab)}
        />
      </div>
    </div>
  )
}
