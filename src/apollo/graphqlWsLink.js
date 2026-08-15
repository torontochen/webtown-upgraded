import { ApolloLink, Observable } from "apollo-link";
import { print } from "graphql";
import { createClient } from "graphql-ws";

/**
 * An Apollo Link that speaks the `graphql-ws` protocol.
 *
 * The server moved from Apollo Server 2's `subscriptions-transport-ws` to
 * `graphql-ws` in Phase 3a. `apollo-link-ws` only speaks the old protocol, and
 * the official `@apollo/client/link/subscriptions` requires Apollo Client 3 —
 * which this app is not on until Phase 4. So this is the small adapter in
 * between: ~25 lines wrapping the graphql-ws client in an ApolloLink.
 *
 * It can be deleted in Phase 4 and replaced with
 * `new GraphQLWsLink(createClient({...}))` from Apollo Client 3.
 */
export class GraphQLWsLink extends ApolloLink {
  constructor(options) {
    super();
    this.client = createClient(options);
  }

  request(operation) {
    return new Observable((observer) => {
      // graphql-ws wants the query as a string; Apollo hands us a DocumentNode.
      return this.client.subscribe(
        {
          operationName: operation.operationName,
          query: print(operation.query),
          variables: operation.variables,
        },
        {
          next: observer.next.bind(observer),
          complete: observer.complete.bind(observer),
          error: observer.error.bind(observer),
        }
      );
    });
  }
}
