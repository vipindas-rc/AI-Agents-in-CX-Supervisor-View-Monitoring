export const REGEX_CONST = {
    I18N_INPUT_NUMBER_SANITATION: /[^\d*+()-/|#"'.,%:;=!?<>`~ [\]]/g,
    E164_NUMBER_SANITATION: /[()\-/|#"'.,%:;=!?<>`~ [\]]|[^\d+]/g,
    E164_PLUS_SANITATION: /(?!^)\+/g,
    INPUT_NUMBER_SANITATION: /[^\d|*]/g,
    SIP: /([Ss][Ii]*[Pp]*[Ss]?).*/g,
    NON_SIP: /[^sSiIpP]/g,
    ALL_DIGITS: /[\d]/g,
    GET_BRACKETS_CONTENT: /\(([^)]+)\)/,
};
