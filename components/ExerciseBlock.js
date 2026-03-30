import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import DropDownPicker from 'react-native-dropdown-picker';
import '../global.css'

export default function ExerciseBlock({
  block,
  index,
  muscleOptions,
  exerciseMap,
  updateInput,
  updateSetValue,
  addSetToBlock,
  removeSetFromBlock,
  removeExerciseBlock,
}) {
  return (
    <View key={block.id} className="mb-6 bg-neutral-900 border border-neutral-700 rounded-2xl p-4">
      <Text className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-3">Exercise {index + 1}</Text>

      {/* Muscle Group Picker */}
      <DropDownPicker
        open={block.muscleOpen || false}
        value={block.muscleGroup}
        items={muscleOptions}
        setOpen={(open) => updateInput(block.id, 'muscleOpen', open)}
        setValue={(callback) => {
          const val = callback(block.muscleGroup);
          updateInput(block.id, 'muscleGroup', val);
          updateInput(block.id, 'exercise', '');
        }}
        placeholder="Select Muscle Group"
        style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 10 }}
        dropDownContainerStyle={{ borderRadius: 12 }}
        textStyle={{ fontSize: 15 }}
        zIndex={1000 - index * 10}
        listMode="SCROLLVIEW"
      />

      {/* Exercise Picker */}
      {block.muscleGroup!==''&&(<DropDownPicker
        open={block.exerciseOpen || false}
        value={block.exercise}
        items={exerciseMap[block.muscleGroup] || []}
        setOpen={(open) => updateInput(block.id, 'exerciseOpen', open)}
        setValue={(callback) => {
          const val = callback(block.exercise);
          updateInput(block.id, 'exercise', val);
        }}
        placeholder="Select Exercise"
        style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 10 }}
        dropDownContainerStyle={{ borderRadius: 12 }}
        textStyle={{ fontSize: 15 }}
        zIndex={900 - index * 10}
        listMode="SCROLLVIEW"
      />)}
      

      {/* Sets */}
      
      {block.exercise !== '' && (
        <View>
          {block.sets.map((set, setIndex) => (
            <View key={setIndex} className="mb-3">
              <Text className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-2">Set {setIndex + 1}</Text>
              <View className="flex-row gap-3 items-center">
                <TextInput
                  className="bg-neutral-800 px-4 text-white rounded-xl h-12 font-semibold flex-1"
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  placeholder="Reps"
                  placeholderTextColor={'#555'}
                  onChangeText={(val) => updateSetValue(block.id, setIndex, 'reps', val)}
                />
                <TextInput
                  className="bg-neutral-800 px-4 text-white rounded-xl h-12 font-semibold flex-1"
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  placeholder="Weight (kg)"
                  placeholderTextColor={'#555'}
                  onChangeText={(val) => updateSetValue(block.id, setIndex, 'weight', val)}
                />
                {block.sets.length > 1 && (
                  <TouchableOpacity onPress={() => removeSetFromBlock(block.id, setIndex)}>
                    <Text className="text-red-500 text-sm font-semibold">✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => addSetToBlock(block.id)} className="mt-2 py-2">
            <Text className="text-orange-500 font-semibold text-sm">+ Add Set</Text>
          </TouchableOpacity>
        </View>
      )}

      

      {index > 0 && (
        <TouchableOpacity onPress={() => removeExerciseBlock(block.id)} className="mt-3">
          <Text className="text-red-500 text-sm font-semibold">Remove Exercise</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
