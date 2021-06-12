import { createHandler } from './util/create-handler';
import axios from 'axios';
import parser from 'fast-xml-parser';

export const handler = createHandler<any, any>(async () => {
  const res = await axios.get('https://feeds.fireside.fm/tolkienprof/rss');
  console.log(res.headers);

  const parserOptions: Partial<parser.X2jOptions> = {
    ignoreAttributes: false,
    ignoreNameSpace: false,
    cdataTagName: 'CDATA',
  };

  const data = parser.convertToJson(
    parser.getTraversalObj(res.data, parserOptions),
    parserOptions
  );
  data.rss.channel.title = 'The Silmarillion Film Project';
  data.rss.channel.item = data.rss.channel.item.filter((item: any) => {
    return item.title.toLowerCase().includes('silmfilm');
  });

  const xmlParser = new parser.j2xParser({
    ignoreAttributes: false,
    cdataTagName: 'CDATA',
  });
  const result = xmlParser.parse(data);

  return {
    statusCode: 200,
    body: result,
    headers: res.headers,
  };
});
