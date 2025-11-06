// This file is no longer used for primary command matching,
// as the logic has been moved to the `interpret-command` AI flow.
// It is kept for reference or potential fallback logic if needed in the future.

export type CommandType = 'emergency' | 'goTo' | 'call' | 'remind' | 'done';

type CommandDictionary = Record<CommandType, string[]>;

/**
 * Retrieves a comprehensive list of voice command keywords across all supported languages.
 * This allows the voice assistant to recognize commands regardless of the app's current UI language.
 *
 * @param t - The translation function from `useLocale`.
 * @returns A dictionary where keys are command types and values are arrays of keyword strings.
 */
export const getVoiceCommands = (t: (key: string) => string): CommandDictionary => {
  const commands: CommandDictionary = {
    emergency: [],
    goTo: [],
    call: [],
    remind: [],
    done: [],
  };

  // English
  commands.emergency.push(...'help, emergency, sos'.split(', '));
  commands.goTo.push(...'go to, navigate to, open, show me'.split(', '));
  commands.call.push(...'call, ring'.split(', '));
  commands.remind.push(...'remind me to, set a reminder, create a reminder'.split(', '));
  commands.done.push(..."done, i've done it, i did it, completed, mark as done".split(', '));

  // Spanish
  commands.emergency.push(...'ayuda, emergencia, sos, socorro'.split(', '));
  commands.goTo.push(...'ir a, navegar a, abre, muéstrame'.split(', '));
  commands.call.push(...'llama a, llamar a'.split(', '));
  commands.remind.push(...'recuérdame, crear un recordatorio, pon un recordatorio'.split(', '));
  commands.done.push(...'hecho, ya lo hice, lo hice, completado, marcar como hecho'.split(', '));

  // French
  commands.emergency.push(...'aide, urgence, sos'.split(', '));
  commands.goTo.push(...'aller à, naviguer vers, ouvrir, montre-moi'.split(', '));
  commands.call.push(...'appelle, appeler'.split(', '));
  commands.remind.push(...'rappelle-moi de, créer un rappel, définir un rappel'.split(', '));
  commands.done.push(...'fait, je l\'ai fait, terminé, marquer comme fait'.split(', '));

  // German
  commands.emergency.push(...'hilfe, notfall, sos'.split(', '));
  commands.goTo.push(...'gehe zu, navigiere zu, öffne, zeige mir'.split(', '));
  commands.call.push(...'anrufen, rufe an'.split(', '));
  commands.remind.push(...'erinnere mich an, erinnere mich daran, erstelle eine erinnerung'.split(', '));
  commands.done.push(...'erledigt, ich habe es getan, ich tat es, abgeschlossen, als erledigt markieren'.split(', '));

  // Hindi
  commands.emergency.push(...'मदद, इमरजेंसी, आपातकाल, एसओएस'.split(', '));
  commands.goTo.push(...'पर जाओ, खोलो, मुझे दिखाओ, चलो'.split(', '));
  commands.call.push(...'को कॉल करो, को फोन करो'.split(', '));
  commands.remind.push(...'मुझे याद दिलाओ, रिमाइंडर लगाओ, रिमाइंडर सेट करो'.split(', '));
  commands.done.push(...'हो गया, मैंने कर लिया, पूरा हो गया'.split(', '));

  // Italian
  commands.emergency.push(...'aiuto, emergenza, sos'.split(', '));
  commands.goTo.push(...'vai a, naviga a, apri, mostrami'.split(', '));
  commands.call.push(...'chiama, chiamare'.split(', '));
  commands.remind.push(...'ricordami di, imposta un promemoria, crea un promemoria'.split(', '));
  commands.done.push(...'fatto, l\'ho fatto, completato, segna come fatto'.split(', '));
  
  // Return a new object with duplicates removed, just in case
  const uniqueCommands = Object.keys(commands).reduce((acc, key) => {
    acc[key as CommandType] = [...new Set(commands[key as CommandType])];
    return acc;
  }, {} as CommandDictionary);

  return uniqueCommands;
};
