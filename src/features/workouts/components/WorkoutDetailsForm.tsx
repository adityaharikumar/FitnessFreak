import {StyleSheet, Text,View,TextInput} from 'react-native';
export type WorkoutFormValues = {
calories:string;
distance:string;
heartRate:string;
notes:string;
};

type WorkoutDetailsFormProps = {
    values: WorkoutFormValues;
    onChange :(values: WorkoutFormValues)=>void;
};
const fields =[
    {
        key:'calories',
        label:'Calories Burned (kcal)',
        keyboard:'decimal-pad',
    },
    {
        key:'distance',
        label:'Distance (km)',
        keyboard:'decimal-pad',
    },{
        key:'heartRate',
        label:' Heart Rate (bpm,optional)',
        keyboard:'number-pad',
    },{
        key:'notes',
        label:'Notes (optional)',
        keyboard:'default',
    }
] as const;
export function WorkoutDetailsForm({values,onChange}:WorkoutDetailsFormProps){
    return(
    <View style={styles.container}>
        {fields.map((field)=>(
            <View key={field.key}>
             <Text style={styles.label}>{field.label}</Text>   
                <TextInput
                accessibilityLabel={field.label}
                value={values[field.key]}
                onChangeText={(text)=>onChange({...values,[field.key]:text,})}
                keyboardType={field.keyboard}
                multiline={field.key==='notes'}
                maxLength={field.key==='notes'?500:12}
                style={
                    [
                        styles.input,
                        field.key==='notes'&& styles.notes,
                    ]
                }
                />
            </View>
        ))}
    
    </View>
    );
}
const styles = StyleSheet.create({
    container: {
    marginTop: 18,
  },
  label: {
    color: '#AAB8B1',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    color: '#FFFFFF',
    backgroundColor: '#101513',
    borderColor: '#26332E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  notes: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
})