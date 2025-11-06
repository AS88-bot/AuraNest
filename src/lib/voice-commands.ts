
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
  // We construct the object inside the function to ensure the `t` function is the one
  // from the current render context, although in practice it doesn't change.
  // The main reason is to have access to `t` without needing to pass it everywhere.
  
  const allLanguages = ['en', 'es', 'fr', 'de', 'hi', 'it'];
  
  const commands: CommandDictionary = {
    emergency: [],
    goTo: [],
    call: [],
    remind: [],
    done: [],
  };

  // This is a bit of a trick. We need to get the translations for each language.
  // The `t` function is bound to the current locale, so we can't use it directly to get
  // other languages' translations. Instead, we manually define the keywords here.
  // This is more robust than trying to dynamically load JSON files.

  // English
  commands.emergency.push(...'help, emergency, sos'.split(', '));
  commands.goTo.push(...'go to, navigate to, open, show me'.split(', '));
  commands.call.push(...'call, ring'.split(', '));
  commands.remind.push(...'remind me to, set a reminder to, create a reminder to, reminder to'.split(', '));
  commands.done.push(..."done, i've done it, i did it, completed, mark as done".split(', '));

  // Spanish
  commands.emergency.push(...'ayuda, emergencia, sos, socorro'.split(', '));
  commands.goTo.push(...'ir a, navegar a, abre, muéstrame'.split(', '));
  commands.call.push(...'llama a, llamar a'.split(', '));
  commands.remind.push(...'recuérdame, crear un recordatorio de, pon un recordatorio para'.split(', '));
  commands.done.push(...'hecho, ya lo hice, lo hice, completado, marcar como hecho'.split(', '));

  // French
  commands.emergency.push(...'aide, urgence, sos'.split(', '));
  commands.goTo.push(...'aller à, naviguer vers, ouvrir, montre-moi'.split(', '));
  commands.call.push(...'appelle, appeler'.split(', '));
  commands.remind.push(...'rappelle-moi de, créer un rappel pour, définir un rappel pour'.split(', '));
  commands.done.push(...'fait, je l\'ai fait, terminé, marquer comme fait'.split(', '));

  // German
  commands.emergency.push(...'hilfe, notfall, sos'.split(', '));
  commands.goTo.push(...'gehe zu, navigiere zu, öffne, zeige mir'.split(', '));
  commands.call.push(...'anrufen, rufe an'.split(', '));
  commands.remind.push(...'erinnere mich an, erinnere mich daran, erstelle eine erinnerung an'.split(', '));
  commands.done.push(...'erledigt, ich habe es getan, ich tat es, abgeschlossen, als erledigt markieren'.split(', '));

  // Hindi
  commands.emergency.push(...'मदद, आपातकाल, एसओएस'.split(', '));
  commands.goTo.push(...'जाओ, पर जाओ, खोलो, मुझे दिखाओ'.split(', '));
  commands.call.push(...'बुलाओ, फ़ोन करो'.split(', '));
  commands.remind.push(...'मुझे याद दिलाओ, एक अनुस्मारक सेट करो, के लिए एक अनुस्मारक बनाओ'.split(', '));
  commands.done.push(...'हो गया, मैंने कर लिया, मैंने किया, पूरा हो गया, पूर्ण के रूप में चिह्नित करें'.split(', '));

  // Italian
  commands.emergency.push(...'aiuto, emergenza, sos'.split(', '));
  commands.goTo.push(...'vai a, naviga a, apri, mostrami'.split(', '));
  commands.call.push(...'chiama, chiamare'.split(', '));
  commands.remind.push(...'ricordami di, imposta un promemoria per, crea un promemoria per'.split(', '));
  commands.done.push(...'fatto, l\'ho fatto, completato, segna come fatto'.split(', '));
  
  // Return a new object with duplicates removed, just in case
  const uniqueCommands = Object.keys(commands).reduce((acc, key) => {
    acc[key as CommandType] = [...new Set(commands[key as CommandType])];
    return acc;
  }, {} as CommandDictionary);

  return uniqueCommands;
};
