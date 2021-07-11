import { HttpClient } from '@angular/common/http';
import { Component, OnInit, VERSION, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Observable, of, from } from 'rxjs';
import { map, tap, share, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;
  loading = false;
  searchTerm: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const person: Person = {
      name: 'Krishna'
    };

    // operators 10
    // creating a stream.
    const personObservable: Observable<Person> = of(person);
    // observable to promise
    const personPromise: Promise<Person> = Promise.resolve(person);
    // promise to observable
    const personObservableFromPromise = from(personPromise);

    personObservable.subscribe(data => console.log(data));

    personObservableFromPromise.subscribe(data => console.log(data));

    // operator 9
    // some operations before getting data from observable.
    const source = of('Krishna');
    source
      // map is used when we want to transform the data.
      // tap is used when we want to just look at the data.
      .pipe(
        tap(name => console.log('name received:' + name)),
        map(name => name.toUpperCase())
      )
      .subscribe(data => console.log('data from source: ' + data));

    // operators 8
    const request = this.getPosts();
    this.setLoadingSpinner(request);

    request.subscribe(data => console.log(data));

    // 7.switch map
    const postsObservable = this.getPosts();
    const commentsObservable = this.getComments();

    const combined = postsObservable.pipe(
      switchMap(posts => {
        return commentsObservable.pipe(
          tap(comments => {
            console.log('posts: ' + posts);
            console.log('comments: ' + comments);
          })
        );
      })
    );

    combined.subscribe();
  }

  search(text$: Observable<string>): Observable<string[]> {
    return text$.pipe(
      switchMap(searchTerm => {
        if (!searchTerm) {
          return [];
        }
        return this.getPostsByTerm(searchTerm);
      })
    );
  }

  setLoadingSpinner(observable: Observable<any>) {
    this.loading = true;
    observable.subscribe(() => (this.loading = false));
  }

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      'https://jsonplaceholder.typicode.com/comments'
    );
  }

  getPosts(): Observable<Post[]> {
    return this.http
      .get<Post[]>('https://jsonplaceholder.typicode.com/posts')
      .pipe(share());
  }

  getPostsByTerm(searchTerm): Observable<Post[]> {
    return this.http
      .get<Post[]>('https://jsonplaceholder.typicode.com/posts')
      .pipe(
        map((posts: Post[]) =>
          posts.filter((post: Post) => post['title'].includes(searchTerm))
        )
      );
  }
}

export interface Person {
  name: string;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}
