import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import type {
  AppConfigFieldMeta,
  ColorSchemePreference,
} from '@/constants/app-config';
import { useAppConfig } from '@/providers/AppConfigProvider';

export default function ConfigScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { config, fields, isReady, setConfigValue, resetConfig } = useAppConfig();

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Tune fetch, live stream, and UI behavior. Values are saved on this device.
        </Text>

        {fields.map((field) => (
          <ConfigField
            key={field.key}
            field={field}
            value={config[field.key]}
            palette={palette}
            onChange={(value) => setConfigValue(field.key, value as never)}
          />
        ))}

        <Pressable
          style={[styles.resetButton, { borderColor: palette.tint }]}
          onPress={resetConfig}>
          <Text style={[styles.resetLabel, { color: palette.tint }]}>Reset to defaults</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

type Palette = typeof Colors.light;

type ConfigFieldProps = {
  field: AppConfigFieldMeta;
  value: number | boolean | ColorSchemePreference;
  palette: Palette;
  onChange: (value: number | boolean | ColorSchemePreference) => void;
};

function ConfigField({ field, value, palette, onChange }: ConfigFieldProps) {
  if (field.type === 'choice') {
    return (
      <ChoiceConfigField
        field={field}
        value={value as ColorSchemePreference}
        palette={palette}
        onChange={onChange}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <View style={styles.field}>
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>{field.label}</Text>
          <Switch
            value={value as boolean}
            onValueChange={onChange}
            trackColor={{ true: palette.tint, false: undefined }}
          />
        </View>
        <Text style={styles.summary}>{field.summary}</Text>
      </View>
    );
  }

  return (
    <NumberConfigField
      field={field}
      value={value as number}
      palette={palette}
      onChange={onChange}
    />
  );
}

type ChoiceConfigFieldProps = {
  field: AppConfigFieldMeta & { type: 'choice' };
  value: ColorSchemePreference;
  palette: Palette;
  onChange: (value: ColorSchemePreference) => void;
};

function ChoiceConfigField({ field, value, palette, onChange }: ChoiceConfigFieldProps) {
  const currentLabel =
    field.options.find((option) => option.value === value)?.label ?? String(value);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <Text style={styles.summary}>{field.summary}</Text>
      <View
        style={[
          styles.choiceValue,
          {
            backgroundColor: palette.inputBackground,
            borderColor: palette.inputBorder,
          },
        ]}>
        <Text style={{ color: palette.text }}>Current: {currentLabel}</Text>
      </View>
      <View style={styles.choiceRow}>
        {field.options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.choiceButton,
                {
                  borderColor: selected ? palette.tint : palette.inputBorder,
                  backgroundColor: selected ? palette.tint : palette.inputBackground,
                },
              ]}>
              <Text
                style={[
                  styles.choiceButtonLabel,
                  { color: selected ? palette.background : palette.text },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type NumberConfigFieldProps = {
  field: AppConfigFieldMeta & { type: 'number' };
  value: number;
  palette: Palette;
  onChange: (value: number) => void;
};

function NumberConfigField({ field, value, palette, onChange }: NumberConfigFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!isFocused) {
      setDraft(String(value));
    }
  }, [value, isFocused]);

  const commit = (text: string) => {
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    const clamped = Math.min(field.max, Math.max(field.min, Math.round(parsed)));
    setDraft(String(clamped));
    onChange(clamped);
  };

  const inputValue = isFocused ? draft : String(value);

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{field.label}</Text>
        {field.unit ? <Text style={styles.unitLabel}>{field.unit}</Text> : null}
      </View>
      <Text style={styles.summary}>{field.summary}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: palette.text,
            backgroundColor: palette.inputBackground,
            borderColor: palette.inputBorder,
          },
        ]}
        value={inputValue}
        onChangeText={(text) => {
          if (isFocused) {
            setDraft(text);
          }
        }}
        onFocus={() => {
          setIsFocused(true);
          setDraft(String(value));
        }}
        onBlur={() => {
          setIsFocused(false);
          commit(draft);
        }}
        onSubmitEditing={() => commit(draft)}
        keyboardType="number-pad"
        returnKeyType="done"
        placeholderTextColor={palette.tabIconDefault}
      />
      <Text style={styles.hint}>Range: {field.min}–{field.max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  unitLabel: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  summary: {
    fontSize: 13,
    opacity: 0.65,
    lineHeight: 18,
    marginBottom: 10,
  },
  choiceValue: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  choiceButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 6,
  },
  resetButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetLabel: {
    fontWeight: '600',
  },
});
