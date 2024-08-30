import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  standalone: true,
  pure: true
})

export class DateAgoPipe implements PipeTransform {
  language: any

  transform(value: any, language: any): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
        return language == 'en' ? 'Just now' : (language == 'fr' ? 'Just now' : (language == 'eu' ? 'Oraintxe' : (language == 'ca' ? 'Ara mateix' : (language == 'de' ? 'Gerade jetzt' : 'En este momento'))));
      let intervals 
      
      if(language == 'en') {
        intervals = {
          'day': 86400,
          'hour': 3600,
          'minute': 60,
          'second': 1
        };
      } else if(language == 'fr') {
        intervals = {
          'jour': 86400,
          'heure': 3600,
          'minute': 60,
          'seconde': 1
        };
      } else if(language == 'eu') {
        intervals = {
          'eguna': 86400,
          'ordua': 3600,
          'minutua': 60,
          'bigarrena': 1
        };
      } else if(language == 'ca') {
        intervals = {
          'dia': 86400,
          'hora': 3600,
          'minut': 60,
          'segon': 1
        };
      } else if(language == 'de') {
        intervals = {
          'tag': 86400,
          'stunde': 3600,
          'minute': 60,
          'zweite': 1
        };
      } else {
        intervals = {
          'día': 86400,
          'hora': 3600,
          'minuto': 60,
          'segundo': 1
        };
      }
      let counter;
      for (const i in intervals) {
          counter = Math.floor(seconds / intervals[i]);
          if (counter > 0)
              if (counter === 1) {
                if(language == 'en') {
                  return counter + ' ' + i + ' ago';
                } else if(language == 'fr') {
                  return counter + ' ' + i + ' ans';
                } else if(language == 'eu') {
                  return counter + ' ' + i + ' egun';
                } else if(language == 'ca') {
                  return 'fa ' + counter + ' ' + i;
                } else if(language == 'de') {
                  return 'vor ' + counter + ' ' + i;
                } else {
                  return 'hace ' + counter + ' ' + i;
                }
              } else {
                if(language == 'en') {
                  return counter + ' ' + i + 's ago';
                } else if(language == 'fr') {
                  if(i == 'année') {
                    return 'il y a ' + counter + ' ans';
                  } else {
                    return counter + ' ' + i + 's';
                  }
                } else if(language == 'eu') {
                  return counter + ' ' + i + ' egun';
                } else if(language == 'ca') {
                  return 'fa ' + counter + ' ' + i;
                } else if(language == 'de') {
                  return 'vor ' + counter + ' ' + i;
                } else {
                  if(i == 'mes') {
                    return 'hace ' + counter + ' ' + i + 'es';
                  } else {
                    return 'hace ' + counter + ' ' + i + 's';
                  }
                }
              }
      }
    }
    return value;
  }
}